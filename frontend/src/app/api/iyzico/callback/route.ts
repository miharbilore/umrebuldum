import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IyzicoGateway } from "@/lib/gateways/iyzico-gateway";
import { withSerializableRetry } from "@/lib/with-retry";
import { EventBus } from "@/core/events/event-bus";
import { TransactionStatus, PaymentProvider } from "@prisma/client";

/**
 * POST /api/iyzico/callback
 * 
 * Iyzico Checkout Form callback handler.
 * Iyzico sends a POST request with a 'token' parameter after payment completion.
 */
export async function POST(req: Request) {
    try {
        // Iyzico sends application/x-www-form-urlencoded
        const formData = await req.formData();
        const token = formData.get("token") as string;

        if (!token) {
            console.error("[Iyzico Callback] Missing token in request");
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const gateway = new IyzicoGateway();
        const result = await gateway.verifyCallback({ token });

        if (!result.success) {
            console.error(`[Iyzico Callback] Verification failed: ${result.error}, token: ${token}`);
            
            // Mark transaction as failed if identifyable
            if (result.sessionId) {
                await prisma.transaction.updateMany({
                    where: { sessionId: result.sessionId, provider: PaymentProvider.IYZICO },
                    data: { status: TransactionStatus.FAILED }
                });
            }
            
            // Redirect to failure page
            const cancelUrl = process.env.NEXT_PUBLIC_APP_URL + "/dashboard/checkout?status=failed&error=" + encodeURIComponent(result.error || "Payment failed");
            return NextResponse.redirect(cancelUrl, 303);
        }

        // â”€â”€ Process successful payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        
        const pendingTx = await prisma.transaction.findFirst({
            where: {
                sessionId: token,
                status: TransactionStatus.PENDING,
                provider: PaymentProvider.IYZICO
            }
        });

        if (!pendingTx) {
            console.warn(`[Iyzico Callback] No pending TX for token: ${token}`);
            const successUrlRedirect = process.env.NEXT_PUBLIC_APP_URL + "/dashboard/checkout?status=success";
            return NextResponse.redirect(successUrlRedirect, 303);
        }

        console.log(`[Iyzico Callback] Processing success for user ${pendingTx.userId}, tx: ${pendingTx.id}`);

        // â”€â”€ Atomic settlement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        await withSerializableRetry(() => 
            prisma.$transaction(async (tx) => {
                // Deduplication
                const existingEvent = await tx.webhookEvent.findUnique({
                    where: { eventId: `iyzico:${token}` }
                });
                if (existingEvent) return;

                await tx.webhookEvent.create({
                    data: {
                        eventId: `iyzico:${token}`,
                        eventType: "iyzico.payment.completed",
                        status: "processed"
                    }
                });

                // Update transaction
                await tx.transaction.update({
                    where: { id: pendingTx.id },
                    data: { 
                        status: TransactionStatus.COMPLETED,
                        providerRef: token 
                    }
                });

                // Update User package if applicable
                const metadata = pendingTx.metadata as any;
                const packageSlug = metadata?.packageSlug;
                if (packageSlug) {
                    await tx.user.update({
                        where: { id: pendingTx.userId },
                        data: { packageType: packageSlug }
                    });
                }
            }, { isolationLevel: "Serializable", timeout: 15_000 })
        );

        // â”€â”€ Emit event for token granting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const txMetadata = pendingTx.metadata as any;
        await EventBus.emit("PAYMENT_COMPLETED", {
            transactionId: pendingTx.id,
            userId: pendingTx.userId,
            amount: pendingTx.credits,
            packageId: txMetadata?.packageSlug || null,
            provider: "iyzico"
        });

        // â”€â”€ Redirect user back to dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const successUrl = process.env.NEXT_PUBLIC_APP_URL + "/dashboard/checkout?status=success";
        return NextResponse.redirect(successUrl, 303);

    } catch (err: any) {
        console.error("[Iyzico Callback] Critical error:", err);
        const errorUrl = process.env.NEXT_PUBLIC_APP_URL + "/dashboard/checkout?status=error";
        return NextResponse.redirect(errorUrl, 303);
    }
}
