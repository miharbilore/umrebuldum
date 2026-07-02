import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { grantToken } from "@/modules/tokens/application/grant-token.usecase";
import { withSerializableRetry } from "@/lib/with-retry";
import { TransactionStatus } from "@/../prisma/generated-client";

// Reconcile stale pending payment transactions.
//
// Intended to run every 10–15 minutes via cron.
// Safe to run concurrently — each row is atomically claimed via WebhookEvent dedup.
//
// LEDGER: All credit grants go through grantToken() → token_ledger_entries.

function getStripe() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        console.warn("[ReconcilePayments] STRIPE_SECRET_KEY is not set.");
        return new Stripe("dummy_key", {
            apiVersion: "2026-01-28.clover" as any,
        });
    }
    return new Stripe(stripeKey, {
        apiVersion: "2026-01-28.clover" as any,
    });
}

const STALE_THRESHOLD_MS = 30 * 60 * 1_000; // 30 minutes

interface ReconcileResult {
    processed: number;
    credited: number;
    failed: number;
    errors: string[];
}

export async function reconcilePendingPayments(): Promise<ReconcileResult> {
    const result: ReconcileResult = { processed: 0, credited: 0, failed: 0, errors: [] };

    const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_MS);

    const stalePending = await prisma.transaction.findMany({
        where: {
            status: TransactionStatus.PENDING,
            createdAt: { lt: staleThreshold },
            sessionId: { not: null },
        },
        select: {
            id: true,
            userId: true,
            credits: true,
            sessionId: true,
            amountTRY: true,
            role: true,
        },
        take: 50,
    });

    for (const tx of stalePending) {
        result.processed++;
        const sessionId = tx.sessionId!;

        try {
            const stripe = getStripe();
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.payment_status === "paid") {
                // ── Grant tokens if not already done ─────────────────────
                await withSerializableRetry(() => prisma.$transaction(async (dbTx) => {
                    // WebhookEvent row — dedup gate
                    try {
                        await dbTx.webhookEvent.create({
                            data: {
                                eventId: `reconcile:${sessionId}`,
                                eventType: "checkout.session.completed",
                                status: "processed",
                            },
                        });
                    } catch (e: any) {
                        if (e.code === "P2002") return; // Already processed
                        throw e;
                    }

                    await dbTx.transaction.updateMany({
                        where: { id: tx.id, status: TransactionStatus.PENDING },
                        data: { status: TransactionStatus.COMPLETED },
                    });
                }, { isolationLevel: "Serializable" }));

                // Grant via unified ledger (has its own atomic transaction)
                await grantToken({
                    userId: tx.userId,
                    amount: tx.credits,
                    type: "PURCHASE",
                    reason: `Reconciled: ${tx.credits} tokens (session ${sessionId})`,
                    relatedId: sessionId,
                    idempotencyKey: `stripe:${sessionId}`,
                });

                result.credited++;
                console.log(`[Reconcile] Credited ${tx.credits} to ${tx.userId} via ${sessionId}`);

            } else {
                await prisma.transaction.updateMany({
                    where: { id: tx.id, status: TransactionStatus.PENDING },
                    data: { status: TransactionStatus.FAILED },
                });
                result.failed++;
                console.log(`[Reconcile] Marked failed: ${sessionId} (status: ${session.status})`);
            }

        } catch (err: any) {
            if (err.code === "P2002") {
                console.log(`[Reconcile] Already credited: ${sessionId}`);
                continue;
            }
            const msg = `[Reconcile] Error on ${sessionId}: ${err.message}`;
            console.error(msg);
            result.errors.push(msg);
        }
    }

    // Mark PENDING rows with no sessionId as failed
    const orphaned = await prisma.transaction.updateMany({
        where: {
            status: TransactionStatus.PENDING,
            sessionId: null,
            createdAt: { lt: staleThreshold },
        },
        data: { status: TransactionStatus.FAILED },
    });


    if (orphaned.count > 0) {
        console.log(`[Reconcile] Marked ${orphaned.count} orphaned sessions as failed.`);
    }

    return result;
}
