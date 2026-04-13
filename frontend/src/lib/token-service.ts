import { prisma } from "./prisma";
import { withSerializableRetry } from "./with-retry";
import { LedgerEntryType } from "@prisma/client";

// â”€â”€â”€ Credit Economy Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class TokenService {
    // Interest costs
    static readonly COST_GUIDE_INTEREST = 5;
    static readonly COST_ORG_INTEREST = 10;

    // Feature cost
    static readonly COST_FEATURE = 10;

    // Feature cap
    static readonly MAX_FEATURED_LISTINGS = 3;

    /**
     * Get REAL balance from User.tokenBalance (Single Source of Truth).
     */
    static async getBalance(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tokenBalance: true },
        });
        return user?.tokenBalance ?? 0;
    }

    /**
     * Deduct credits atomically and idempotently.
     *
     * Safety guarantees:
     * 1. Idempotency: if `idempotencyKey` was already used, return success with no-op.
     * 2. Row-level lock: uses SELECT SUM ... FOR UPDATE to lock all rows for this userId,
     *    preventing concurrent transactions from reading stale balances.
     * 3. Strict non-negative balance: rejects if balance - cost < 0.
     * 4. All writes (ledger + cache) happen inside a single $transaction.
     */
    static async deductCredits(
        userId: string,
        cost: number,
        reason: string,
        relatedId?: string,
        idempotencyKey?: string
    ): Promise<{ success: boolean; newBalance: number; idempotent?: boolean }> {
        try {
            const result = await withSerializableRetry(() => prisma.$transaction(async (tx) => {
                // â”€â”€ (1) Idempotency check: if key exists, return cached result â”€â”€
                if (idempotencyKey) {
                    const existing = await tx.tokenTransaction.findUnique({
                        where: { idempotencyKey_userId: { idempotencyKey, userId } }
                    });
                    if (existing) {
                        const user = await tx.user.findUnique({
                            where: { id: userId },
                            select: { tokenBalance: true },
                        });
                        return { newBalance: user?.tokenBalance ?? 0, idempotent: true };
                    }
                }

                // â”€â”€ (2) Row-level lock via raw SQL (MySQL SELECT FOR UPDATE) â”€â”€
                // Single Source of Truth: ONLY User.tokenBalance
                const [balanceRow] = await tx.$queryRaw<[{ balance: number }]>`
                    SELECT availableBalance AS balance
                    FROM users
                    WHERE id = ${userId}
                    FOR UPDATE
                `;
                const currentBalance = Number(balanceRow.balance);

                // â”€â”€ (3) Strict non-negative guard â”€â”€
                if (currentBalance - cost < 0) {
                    throw new Error('INSUFFICIENT_CREDITS');
                }

                // â”€â”€ (4) Write to unified TokenTransaction ledger â”€â”€
                await tx.tokenTransaction.create({
                    data: {
                        userId,
                        amount: -cost,
                        entryType: LedgerEntryType.CONSUME,
                        reasonCode: reason,
                        referenceId: relatedId || null,
                        idempotencyKey: idempotencyKey || `spend:${Date.now()}-${Math.random()}`,
                    }
                });

                // â”€â”€ (5) Decrement ONLY User.tokenBalance (Single Source of Truth) â”€â”€
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { tokenBalance: { decrement: cost } },
                });

                return { newBalance: updatedUser.tokenBalance, idempotent: false };
            }, {
                isolationLevel: 'Serializable',
                timeout: 10000,
            }));

            console.log(`[CreditService] Deducted ${cost} from ${userId}: ${reason}. New balance: ${result.newBalance}${result.idempotent ? ' (idempotent no-op)' : ''}`);
            return { success: true, newBalance: result.newBalance, idempotent: result.idempotent };

        } catch (error: any) {
            if (error.message === 'INSUFFICIENT_CREDITS') {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { tokenBalance: true },
                });
                return { success: false, newBalance: user?.tokenBalance ?? 0 };
            }
            // P2002 = unique constraint violation â†’ idempotency key collision (parallel race both passed check)
            if (error.code === 'P2002') {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { tokenBalance: true },
                });
                return { success: true, newBalance: user?.tokenBalance ?? 0, idempotent: true };
            }
            throw error;
        }
    }

    /**
     * Grant credits atomically:
     * 1. Insert CreditTransaction (positive amount)
     * 2. Increment GuideProfile.credits (cache)
     */
    static async grantCredits(
        userId: string,
        amount: number,
        type: "purchase" | "refund" | "admin",
        reason: string,
        relatedId?: string,
        idempotencyKey?: string
    ): Promise<number> {
        const result = await withSerializableRetry(() => prisma.$transaction(async (tx) => {
            // Idempotency check
            if (idempotencyKey) {
                const existing = await tx.tokenTransaction.findUnique({
                    where: { idempotencyKey_userId: { idempotencyKey, userId } }
                });
                if (existing) {
                    const user = await tx.user.findUnique({
                        where: { id: userId },
                        select: { tokenBalance: true },
                    });
                    return user?.tokenBalance ?? 0;
                }
            }

            // Write to unified TokenTransaction ledger
            await tx.tokenTransaction.create({
                data: {
                    userId,
                    amount,
                    entryType: type === "refund" ? LedgerEntryType.REFUND : type === "purchase" ? LedgerEntryType.PURCHASE : LedgerEntryType.ADJUSTMENT,
                    reasonCode: reason,
                    referenceId: relatedId || null,
                    idempotencyKey: idempotencyKey || `grant:${Date.now()}-${Math.random()}`,
                }
            });

            // â”€â”€ Single Source of Truth: Update ONLY User.tokenBalance â”€â”€
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { tokenBalance: { increment: amount } },
            });

            return updatedUser.tokenBalance;
        }));

        console.log(`[CreditService] Granted ${amount} to ${userId} (${type}): ${reason}. New balance: ${result}`);
        return result;
    }

    /**
     * Sync: returns authoritative User.tokenBalance.
     * GuideProfile.credits is deprecated as the source of truth.
     */
    static async syncBalance(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tokenBalance: true },
        });
        return user?.tokenBalance ?? 0;
    }
}
