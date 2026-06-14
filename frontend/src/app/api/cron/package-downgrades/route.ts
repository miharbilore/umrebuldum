import { NextResponse } from "next/server";
import { runPackageDowngrades } from "@/jobs/package-downgrade.job";

/**
 * GET /api/cron/package-downgrades
 * Runs daily via cron. Checks for packages that have expired.
 * Downgrades the users to FREEMIUM and removes packageExpiry.
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

        const result = await runPackageDowngrades();

        return NextResponse.json(result);

    } catch (err) {
        console.error("[Cron] package-downgrades failed:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
