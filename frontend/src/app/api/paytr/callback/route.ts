import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PayTRGateway } from "@/lib/gateways/paytr-gateway";
import { withSerializableRetry } from "@/lib/with-retry";
import { EventBus } from "@/core/events/event-bus";
import { TransactionStatus, PaymentProvider } from "@prisma/client";

/**
 * POST /api/paytr/callback
 *
 * PayTR bildirim (callback) URL handler.
 * PayTR sends POST to this endpoint when a payment is completed or fails.
 *
 * Idempotency:
 *   1. WebhookEvent dedup on "paytr:{merchant_oid}" (same pattern as Stripe)
 *   2. grantToken() has its own idempotencyKey
 *
 * Security:
 *   - HMAC-SHA256 hash verification via PayTRGateway.verifyCallback()
 *   - No auth session needed (server-to-server callback)
 *
 * Response:
 *   - Must return "OK" for PayTR to stop retrying
 */
export async function POST(req: Request) {
    try {
        // PayTR sends application/x-www-form-urlencoded
        const body = await req.text();
        const params = Object.fromEntries(new URLSearchParams(body));

        const gateway = new PayTRGateway();
        const result = await gateway.verifyCallback(params);

        const merchantOid = result.merchantOid || params.merchant_oid;

        if (!result.success) {
            console.error(`[PayTR Callback] Failed: ${result.error}, oid: ${merchantOid}`);

            // Mark transaction as failed if we can identify it
            if (merchantOid) {
                await prisma.transaction.updateMany({
                    where: { id: merchantOid, status: TransactionStatus.PENDING, provider: PaymentProvider.PAYTR },
                    data: { status: TransactionStatus.FAILED },
                });
            }

            // Still return OK so PayTR stops retrying
            return new NextResponse("OK", { status: 200 });
        }

        // â”€â”€ Process successful payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // Find the pending transaction by ID (merchant_oid = our internal tx ID)
        const pendingTx = await prisma.transaction.findFirst({
            where: {
                id: merchantOid!,
                status: TransactionStatus.PENDING,
                provider: PaymentProvider.PAYTR,
            },
        });

        if (!pendingTx) {
            console.warn(`[PayTR Callback] No pending TX for oid: ${merchantOid}`);
            return new NextResponse("OK", { status: 200 });
        }

        console.log(`[PayTR Callback] Processing payment for user ${pendingTx.userId}, ${pendingTx.credits} credits`);

        // â”€â”€ Atomic settlement (same pattern as Stripe webhook) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        await withSerializableRetry(() =>
            prisma.$transaction(async (tx) => {
                // WebhookEvent dedup (same table as Stripe)
                await tx.webhookEvent.create({
                    data: {
                        eventId: `paytr:${merchantOid}`,
                        eventType: "paytr.payment.completed",
                        status: "processed",
                    },
                });

                // Mark transaction as completed
                await tx.transaction.updateMany({
                    where: { id: merchantOid!, status: TransactionStatus.PENDING },
                    data: { status: TransactionStatus.COMPLETED },
                });

                const metadata = pendingTx.metadata as any;
                const packageSlug = metadata?.packageSlug;
                if (packageSlug) {
                    await tx.user.updateMany({
                        where: { id: pendingTx.userId },
                        data: { packageType: packageSlug },
                    });
                }
            }, { isolationLevel: "Serializable", timeout: 15_000 })
        );

        // â”€â”€ Grant tokens event triggered â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const txMetadata = pendingTx.metadata as any;
        await EventBus.emit("PAYMENT_COMPLETED", {
            transactionId: merchantOid!,
            userId: pendingTx.userId,
            amount: pendingTx.credits,
            packageId: txMetadata?.packageSlug || null,
            provider: "paytr",
        });

        console.log(`[PayTR Callback] Payment handled & event dispatched for user ${pendingTx.userId}`);

        // â”€â”€ Save card if token was returned â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (result.cardToken && result.last4) {
            try {
                await prisma.savedCard.upsert({
                    where: {
                        userId_cardToken: {
                            userId: pendingTx.userId,
                            cardToken: result.cardToken,
                        },
                    },
                    create: {
                        userId: pendingTx.userId,
                        provider: PaymentProvider.PAYTR,
                        cardToken: result.cardToken,
                        userToken: result.userToken || null,
                        last4: result.last4,
                        brand: result.brand || "unknown",
                        expiryMonth: 0, // PayTR doesn't always return these
                        expiryYear: 0,
                        isDefault: false,
                    },
                    update: {
                        userToken: result.userToken || undefined,
                    },
                });
                console.log(`[PayTR Callback] Card saved for user ${pendingTx.userId}`);
            } catch (err: any) {
                // Non-critical â€” log but don't fail
                console.error(`[PayTR Callback] Failed to save card: ${err.message}`);
            }
        }

        return new NextResponse("OK", { status: 200 });

    } catch (err: any) {
        // P2002 = duplicate WebhookEvent â†’ already processed
        if (err.code === "P2002") {
            console.log(`[PayTR Callback] Duplicate callback â€” already processed`);
            return new NextResponse("OK", { status: 200 });
        }

        console.error(`[PayTR Callback] Error:`, err);
        // PayTR retries on non-OK response, but we want to be cautious
        return new NextResponse("OK", { status: 200 });
    }
}
