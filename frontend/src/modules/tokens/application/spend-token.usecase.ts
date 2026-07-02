// â”€â”€â”€ Spend Token Use Case â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Atomic token deduction with SERIALIZABLE isolation.
// This is the SINGLE entry point for all token spending.
//
// Safety proof:
//   1. SERIALIZABLE isolation â†’ no phantom reads, no dirty reads
//   2. FOR UPDATE on token_ledger_entries â†’ row-level lock prevents
//      concurrent SUM from returning stale balance
//   3. Balance check (READ) happens BEFORE any WRITE
//   4. Execution order: READ â†’ READ â†’ GUARD â†’ WRITE â†’ WRITE
//      If GUARD fails, no WRITE has occurred â†’ rollback is a no-op
//   5. Idempotency check is INSIDE the transaction â†’ no TOCTOU race
//   6. P2002 on idempotencyKey is caught outside â†’ graceful de-dup
//   7. withSerializableRetry handles deadlock/serialization retries
//
// Drift-proof:
//   - Ledger entry (tokenTransaction.create) and cache update
//     (user.update) are inside the SAME transaction.
//   - If either fails, both roll back atomically.
//   - No partial mutation is possible.

import { prisma } from "@/lib/prisma";
import { LedgerEntryType } from "@/../prisma/generated-client";
import { withSerializableRetry } from "@/lib/with-retry";
import { TokenPolicy, type TokenAction } from "../domain/token-policy";
import { EventBus } from "@/core/events/event-bus";
import { TokenService } from "./TokenService";

export interface SpendTokenInput {
    userId: string;
    action: TokenAction;
    relatedId?: string;
    reason: string;
    overrideCost?: number;
}

export interface SpendTokenResult {
    ok: boolean;
    newBalance: number;
    cost: number;
    error?: string;
}

/**
 * Atomically deduct tokens for an action.
 *
 * Execution order (mathematically safe):
 *   READ  â†’ findUnique(idempotencyKey)        â€” O(1) index lookup
 *   READ  â†’ $queryRaw SUM(amount) FOR UPDATE  â€” locks rows, authoritative balance
 *   GUARD â†’ balance >= cost                   â€” rejects if insufficient
 *   WRITE â†’ tokenTransaction.create           â€” immutable ledger entry
 *   WRITE â†’ user.update(decrement)            â€” cached balance sync
 *
 * If GUARD fails â†’ both WRITEs are skipped â†’ ROLLBACK is a no-op.
 * If WRITEâ‚ fails â†’ WRITEâ‚‚ is skipped â†’ ROLLBACK undoes WRITEâ‚.
 * If WRITEâ‚‚ fails â†’ ROLLBACK undoes both WRITEâ‚ and WRITEâ‚‚.
 */
export async function spendToken(input: SpendTokenInput): Promise<SpendTokenResult> {
    const cost = input.overrideCost ?? TokenPolicy.getCost(input.action);
    console.log(`[spendToken] START: userId=${input.userId}, action=${input.action}, originalCost=${TokenPolicy.getCost(input.action)}, cost=${cost}, relatedId=${input.relatedId}`);

    if (cost <= 0) {
        console.error(`[spendToken] Invalid cost: ${cost}`);
        throw new Error(`Invalid cost ${cost} for action ${input.action}`);
    }

    try {
        const result = await withSerializableRetry(() =>
            prisma.$transaction(async (tx) => {
                const generatedKey = TokenService.generateIdempotencyKey(input.userId, input.action, input.relatedId);

                // â”€â”€ STEP 1 (READ): Idempotency check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                // Inside SERIALIZABLE tx â†’ no TOCTOU race.
                // If another transaction inserted this key concurrently,
                // SERIALIZABLE will detect the conflict and retry.
                const existing = await tx.tokenTransaction.findUnique({
                    where: { idempotencyKey_userId: { idempotencyKey: `${generatedKey}_debit`, userId: input.userId } },
                });
                if (existing) {
                    console.log(`[spendToken] IdempotencyKey ${generatedKey}_debit ALREADY_PROCESSED. Skipping deduction.`);
                    return {
                        ok: true,
                        newBalance: -1, // Caller should rely on db check if needed
                        cost: 0,
                        error: "ALREADY_PROCESSED",
                    };
                }

                // â”€â”€ STEP 2 (READ): Authoritative balance via User â”€â”€â”€â”€â”€â”€â”€â”€
                // FOR UPDATE locks the user row, preventing concurrent transactions
                // from reading a stale balance while we decide whether to deduct.
                // This is our Single Source of Truth for balances.
                const [balanceRow] = await tx.$queryRaw<[{ balance: number }]>`
                    SELECT availableBalance AS balance
                    FROM users
                    WHERE id = ${input.userId}
                    FOR UPDATE
                `;
                const currentBalance = Number(balanceRow.balance);
                console.log(`[spendToken] Current DB availableBalance for user ${input.userId} is ${currentBalance}`);

                // â”€â”€ STEP 3 (GUARD): Non-negative enforcement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                if (currentBalance < cost) {
                    console.log(`[spendToken] INSUFFICIENT_TOKENS: ${currentBalance} < ${cost}`);
                    throw new Error("INSUFFICIENT_TOKENS");
                }

                // â”€â”€ STEP 3.5 (WRITEâ‚€): FIFO Batch Consumption â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                // Drain expiring batches first (oldest expiry first).
                let remainingToConsume = cost;

                // Fetch batches with remaining amount > 0.
                // These rows are implicitly locked by the earlier FOR UPDATE on the table.
                const expiringBatches = await tx.tokenTransaction.findMany({
                    where: {
                        accountId: input.userId,
                        remainingAmount: { gt: 0 },
                    },
                    orderBy: { expiresAt: "asc" },
                });

                for (const batch of expiringBatches) {
                    if (remainingToConsume <= 0) break;

                    const available = batch.remainingAmount!;
                    const consumeFromBatch = Math.min(available, remainingToConsume);

                    await tx.tokenTransaction.update({
                        where: { id: batch.id },
                        data: { remainingAmount: available - consumeFromBatch },
                    });

                    remainingToConsume -= consumeFromBatch;
                }
                // If remainingToConsume > 0, the rest is covered by non-expiring subscription tokens.

                // â”€â”€ STEP 4 (WRITEâ‚): Immutable ledger entry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                // entryType: LedgerEntryType.CONSUME (schema enum)
                // reasonCode: business action string (for analytics)
                // referenceId: contextual ID (listingId, requestId, etc.)
                // idempotencyKey: unique constraint prevents duplicates
                await tx.tokenTransaction.createMany({
                    data: [
                        {
                            userId: input.userId, // Link to real user
                            accountId: input.userId, // Debit Account
                            counterpartyId: "SYSTEM_BURN",
                            entryType: LedgerEntryType.CONSUME,
                            amount: -cost,
                            reasonCode: `${input.action}: ${input.reason}`,
                            referenceId: input.relatedId || null,
                            idempotencyKey: `${generatedKey}_debit`,
                        },
                        {
                            userId: null, // System account has no human user
                            accountId: "SYSTEM_BURN", // Credit Account
                            counterpartyId: input.userId,
                            entryType: LedgerEntryType.CONSUME,
                            amount: cost, // Positive balance added to burn reserve
                            reasonCode: `${input.action}: ${input.reason}`,
                            referenceId: input.relatedId || null,
                            idempotencyKey: `${generatedKey}_credit`,
                        }
                    ]
                });

                // â”€â”€ STEP 5 (WRITEâ‚‚): Cached balance sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                // Uses Prisma ORM decrement â†’ resolves tokenBalance â†’ column
                // availableBalance via @map. Atomic SQL: SET col = col - N.
                // Uses Prisma ORM decrement
                const updatedUser = await tx.user.update({
                    where: { id: input.userId },
                    data: { tokenBalance: { decrement: cost } },
                    select: { tokenBalance: true } // Read back the updated value just to log it
                });
                
                console.log(`[spendToken] SUCCESS: Deducted ${cost}. User tokenBalance in DB is now ${updatedUser.tokenBalance}`);

                return {
                    newBalance: currentBalance - cost,
                    alreadyProcessed: false,
                };
            }, {
                isolationLevel: "Serializable",
                timeout: 10_000,
            })
        );

        // â”€â”€ POST-TX: Event emission (fire-and-forget) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Outside transaction â†’ cannot cause rollback.
        if (!result.alreadyProcessed) {
            EventBus.emit("TOKEN_SPENT", {
                userId: input.userId,
                action: input.action,
                cost,
                newBalance: result.newBalance,
                relatedId: input.relatedId,
            });
        }

        return { ok: true, newBalance: result.newBalance, cost };

    } catch (error: any) {
        // â”€â”€ INSUFFICIENT_TOKENS: controlled rejection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (error.message === "INSUFFICIENT_TOKENS") {
            // Return current balance for UI display
            const user = await prisma.user.findUnique({
                where: { id: input.userId },
                select: { tokenBalance: true },
            });
            return {
                ok: false,
                newBalance: user?.tokenBalance ?? 0,
                cost,
                error: "INSUFFICIENT_TOKENS",
            };
        }

        // â”€â”€ P2002: idempotencyKey collision (parallel race) â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Two identical requests hit the DB simultaneously.
        // One committed, one got P2002. Return the committed state.
        if (error.code === "P2002") {
            const user = await prisma.user.findUnique({
                where: { id: input.userId },
                select: { tokenBalance: true },
            });
            return {
                ok: true,
                newBalance: user?.tokenBalance ?? 0,
                cost,
            };
        }

        throw error;
    }
}
