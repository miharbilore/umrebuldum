
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireAuth } from '@/lib/api-guards';
import { DAILY_CAPS } from '@/lib/package-system';
import { PackageTier } from '@prisma/client';

export async function GET() {
    const session = await auth();
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    const userId = session!.user.id!;

    try {
        // 1. Fetch current balance and package from DB (Authoritative)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                tokenBalance: true,
                packageType: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Compute "Daily Used" offers
        // Count CONSUME entries with reasonCode involving 'OFFER_SEND' for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const dailyUsed = await prisma.tokenTransaction.count({
            where: {
                userId,
                entryType: 'CONSUME',
                reasonCode: { contains: 'OFFER_SEND' },
                createdAt: { gte: startOfDay }
            }
        });

        // 3. Get Limits from PackageSystem (DAILY_CAPS)
        const caps = DAILY_CAPS[user.packageType] || DAILY_CAPS.FREEMIUM;

        return NextResponse.json({
            tokenBalance: user.tokenBalance,
            packageType: user.packageType,
            daily_limit: caps.offers,
            daily_used: dailyUsed,
            // Map to the legacy interface expected by UI if necessary, 
            // but we'll refactor the UI to use these clean names.
            features: {
                // Feature gating logic can be added here or calculated on client
                can_generate: user.packageType !== 'FREEMIUM',
                high_quality: user.packageType === 'PREMIUM' || user.packageType === 'PRO',
            }
        });
    } catch (error) {
        console.error("[Quota API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
