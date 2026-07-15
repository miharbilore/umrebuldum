import { prisma } from "./prisma";
import { grantToken } from "@/modules/tokens/application/grant-token.usecase";
import { TransactionStatus } from "@/../prisma/generated-client";

export class PaymentService {
    /**
     * Handle refund (admin-initiated).
     *
     * This now only processes DB-level refunds and ledger adjustments
     * since PayTR requires panel or API based refunding which is currently manual.
     */
    static async refund(transactionId: string, adminId: string, reason: string) {
        let refundCredits = 0;
        let refundUserId = "";

        // ── Atomic DB operations ─────────────────────────────────────────
        await prisma.$transaction(async (tx) => {
            const rows = await tx.$queryRaw<Array<{
                id: string;
                userId: string;
                credits: number;
                status: string;
                sessionId: string | null;
            }>>`
                SELECT id, userId, credits, status, sessionId
                FROM transactions
                WHERE id = ${transactionId}
                FOR UPDATE
            `;

            const payment = rows[0];
            if (!payment) throw new Error("TRANSACTION_NOT_FOUND");
            if (payment.status !== TransactionStatus.COMPLETED) throw new Error("NOT_REFUNDABLE");

            refundCredits = payment.credits;
            refundUserId = payment.userId;

            // Mark refunded atomically
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: TransactionStatus.REFUNDED },
            });
        }, { isolationLevel: "Serializable", timeout: 15_000 });

        // ── Write refund to unified ledger (outside lock) ────────────────
        await grantToken({
            userId: refundUserId,
            amount: -refundCredits,
            type: "REFUND",
            reason: `Refund by admin ${adminId}: ${reason}`,
            relatedId: transactionId,
            idempotencyKey: `refund:${transactionId}`,
        });

        // PayTR refund API call would go here if implemented in the future.
        console.log(`[PaymentService] DB refund completed for tx: ${transactionId}. PayTR manual refund may be required.`);

        return { success: true };
    }
}
