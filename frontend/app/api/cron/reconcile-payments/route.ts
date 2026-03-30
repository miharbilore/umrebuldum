import { NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/lib/jobs/reconcile-pending-payments";
import { timingSafeEqual } from "crypto";

/**
 * Timing-safe bearer token comparison to prevent timing attacks.
 */
function isValidCronSecret(authHeader: string | null, secret: string): boolean {
    if (!authHeader) return false;
    const provided = authHeader.replace("Bearer ", "");
    if (provided.length !== secret.length) return false;
    try {
        return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
    } catch {
        return false;
    }
}

/**
 * GET /api/cron/reconcile-payments
 *
 * Reconciles stale pending payment transactions.
 * Should be called every 10-15 minutes by a cron scheduler.
 *
 * Security: Protected by CRON_SECRET header with timing-safe comparison.
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Require CRON_SECRET in production
    if (process.env.NODE_ENV === "production") {
        if (!cronSecret || !isValidCronSecret(authHeader, cronSecret)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        const result = await reconcilePendingPayments();
        return NextResponse.json({ ok: true, ...result });
    } catch (err: any) {
        console.error("[Cron] reconcile-payments failed:", err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
