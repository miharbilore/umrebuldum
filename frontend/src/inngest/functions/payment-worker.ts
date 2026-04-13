import { inngest } from "@/inngest/client";
import { grantToken } from "@/modules/tokens/application/grant-token.usecase";
import { EventBus } from "@/core/events/event-bus";

/**
 * Payment Completion Worker
 * 
 * Listens to the `PAYMENT_COMPLETED` event triggered by Webhooks (Stripe/PayTR).
 * Safely executes the double-entry accounting (grantToken) logic with automatic retries if the DB fails.
 */
export const handlePaymentCompletion = inngest.createFunction(
    { id: "payment-completion-worker", name: "Payment Completion Worker", retries: 5, triggers: [{ event: "event/PAYMENT_COMPLETED" }] },
    async ({ event, step }: { event: any, step: any }) => {
        const { transactionId, userId, amount, packageId, provider } = event.data;

        // 1. Grant Tokens (Safe Double-Entry Ledger)
        await step.run("grant-tokens", async () => {
            await grantToken({
                userId,
                amount,
                type: "PURCHASE",
                reason: `${provider || 'System'} purchase: ${amount} tokens (tx: ${transactionId})`,
                relatedId: transactionId,
                // Webhooks generate identical transactions, so we use transactionId to deduplicate
                idempotencyKey: `payment_grant_${transactionId}`,
            });
        });

        // 2. Dispatch Success Notification
        await step.run("dispatch-notification", async () => {
            await EventBus.emit("NOTIFICATION_CREATE", {
                userId,
                type: "IN_APP",
                title: "Ödeme Başarılı",
                message: `Teşekkürler! Hesabınıza ${amount} kredi başarıyla yüklendi.`,
                referenceId: transactionId
            });
        });

        return {
            success: true,
            transactionId,
            userId,
            amountGranted: amount
        };
    }
);
