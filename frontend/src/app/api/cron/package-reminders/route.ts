import { NextResponse } from "next/server";
import { runPackageReminders } from "@/jobs/package-reminders.job";

/**
 * GET /api/cron/package-reminders
 * Runs daily via cron. Checks for paid packages expiring in exactly 3 days.
 * Sends an in-app notification to the user.
 */
export async function GET(req: Request) {
    try {
        // Protect endpoint: require CRON_SECRET if environment is production
        const authHeader = req.headers.get("authorization");
        if (
            process.env.NODE_ENV === "production" &&
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await runPackageReminders();

        return NextResponse.json(result);

    } catch (err) {
        console.error("[Cron] package-reminders failed:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
