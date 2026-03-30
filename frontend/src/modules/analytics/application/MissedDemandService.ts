// ─── Missed Demand Service (Capacity Gap Engine) ──────────────────────────
// Powers the "Missed Demand" widget on the FREEMIUM tier dashboard.
// Calculates how many active leads/searches an agency missed because
// they are limited to 1 city listing by the FREEMIUM plan.

import { prisma } from '@/lib/prisma';
import { PackageSystem, PLAN_PRICES_TRY } from '@/lib/package-system';

export class MissedDemandService {

    /**
     * Calculates the demand an agency is missing out on due to package limitations.
     * Shows high-volume cities where the agency does NOT have a listing.
     */
    static async getMissedDemandData(guideId: string) {
        // 1. Check Package
        const user = await prisma.user.findUnique({
            where: { id: guideId },
            select: { packageType: true }
        });

        const pkg = user?.packageType || "FREEMIUM";
        const maxListingsAllowed = (await PackageSystem.getLimits(pkg)).maxListings;

        // If they have 10+ limits (BUSINESS or BUSINESS_PLUS), the Capacity Gap angle isn't as relevant.
        // We primarily use this to upsell FREE (1) -> PLUS (2) -> PRO (3)
        if (maxListingsAllowed >= 10) return null;

        // 2. Find their active service cities
        const activeListings = await prisma.guideListing.findMany({
            where: { guideId, approvalStatus: "APPROVED", active: true },
            select: { city: true }
        });
        const activeCities = activeListings.map(l => l.city);

        // 3. Query high-demand Leads (UmrahRequests) in the last 7 days
        // that are NOT in their active cities.
        const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

        const demandAgg = await prisma.umrahRequest.groupBy({
            by: ['departureCity'],
            where: {
                createdAt: { gte: oneWeekAgo },
                departureCity: { notIn: activeCities }, // Cities they DO NOT serve
                status: "open",
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 3
        });

        if (demandAgg.length === 0) return null;

        // 4. Summarize
        const totalMissedLeads = demandAgg.reduce((sum, agg) => sum + agg._count.id, 0);
        const topMissedCity = demandAgg[0].departureCity;
        const topMissedCount = demandAgg[0]._count.id;

        // Determine the next logical upgrade based on current package
        let upgradeTarget = "";
        let upgradePrice = 0;
        let newListingLimit = 0;

        if (pkg === "FREEMIUM") {
            upgradeTarget = "PREMIUM";
            upgradePrice = PLAN_PRICES_TRY["PREMIUM"];
            newListingLimit = (await PackageSystem.getLimits("PLUS")).maxListings;
        } else if (pkg === "PLUS") {
            upgradeTarget = "PRO";
            upgradePrice = PLAN_PRICES_TRY["PRO"];
            newListingLimit = (await PackageSystem.getLimits("PRO")).maxListings;
        } else {
            upgradeTarget = "PRO";
            upgradePrice = PLAN_PRICES_TRY["PRO"];
            newListingLimit = (await PackageSystem.getLimits("PRO")).maxListings;
        }

        return {
            totalMissedLeadsIn7Days: totalMissedLeads,
            topMissingCity: {
                name: topMissedCity,
                leadCount: topMissedCount
            },
            nudgeMessage: `🔥 Bu hafta ${topMissedCity} çıkışlı ${topMissedCount} yeni müşteri talebi geldi!`,
            callToAction: `Mevcut paketiniz sadece ${maxListingsAllowed} şehirde görünmenize izin veriyor. ${newListingLimit} farklı şehirde listelenip bu teklifleri yakalamak için ${upgradePrice}₺ ile ${upgradeTarget} pakete geçin.`,
            upgradeTargetPlan: upgradeTarget
        };
    }
}
