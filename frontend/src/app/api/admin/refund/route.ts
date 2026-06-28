import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { PaymentService } from "@/lib/payment-service";

interface RefundRequest {
    transactionId: string;
    reason: string;
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const { transactionId, reason } = (await req.json()) as RefundRequest;

        if (!transactionId || !reason) {
            return NextResponse.json({ error: "Missing transactionId or reason" }, { status: 400 });
        }

        const adminId = session!.user.id!;

        await PaymentService.refund(transactionId, adminId, reason);

        return NextResponse.json({
            success: true,
            message: `Transaction ${transactionId} refunded successfully`
        });

    } catch (error: unknown) {
        console.error("Admin refund error:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Error" }, { status: 500 });
    }
}
