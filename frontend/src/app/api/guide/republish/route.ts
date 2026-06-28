import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";
import { getRoleConfig } from "@/lib/role-config";
import { PackageSystem, TOKEN_COSTS } from "@/lib/package-system";
import { spendToken } from "@/modules/tokens/application/spend-token.usecase";
import { safeErrorMessage } from "@/lib/safe-error";

interface RepublishRequest {
    listingId: string;
}

interface RepublishResponse {
    success?: boolean;
    message?: string;
    error?: string;
    expiresAt?: string;
    tokenBalance?: number;
    cost?: number;
    limit?: number;
}

/**
 * POST /api/guide/republish
 * Republish an expired listing. Costs REPUBLISH tokens. Resets expiresAt.
 *
 * Body: { listingId: string }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const roleConfig = getRoleConfig(session!.user.role);
        if (!roleConfig.canRepublish) {
            return NextResponse.json<RepublishResponse>({ error: "Upgrade required to republish" }, { status: 403 });
        }

        const { listingId } = (await req.json()) as RepublishRequest;
        if (!listingId) {
            return NextResponse.json<RepublishResponse>({ error: "Missing listingId" }, { status: 400 });
        }

        // Resolve user
        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! },
            select: { id: true, packageType: true },
        });
        if (!user) return NextResponse.json<RepublishResponse>({ error: "User not found" }, { status: 404 });

        // Verify listing exists, belongs to user, and is EXPIRED
        const listing = await prisma.guideListing.findUnique({
            where: { id: listingId },
        });
        if (!listing) return NextResponse.json<RepublishResponse>({ error: "Listing not found" }, { status: 404 });
        if (listing.guideId !== user.id) {
            return NextResponse.json<RepublishResponse>({ error: "Not your listing" }, { status: 403 });
        }
        if (listing.approvalStatus === "REJECTED") {
            return NextResponse.json<RepublishResponse>({ error: "Listing is rejected" }, { status: 400 });
        }

        // Check active listing count (republishing = reactivating)
        const activeCount = await prisma.guideListing.count({
            where: { guideId: user.id, active: true },
        });
        if (!(await PackageSystem.canCreateListing(user.packageType, activeCount))) {
            const limits = await PackageSystem.getLimits(user.packageType);
            return NextResponse.json<RepublishResponse>({
                error: "MAX_LISTINGS_REACHED",
                limit: limits.maxListings,
            }, { status: 403 });
        }

        const spendResult = await spendToken({
            userId: user.id,
            action: "REPUBLISH",
            relatedId: listingId,
            reason: `Republish listing: ${listing.title}`,
        });

        if (!spendResult.ok) {
            if (spendResult.error === "INSUFFICIENT_TOKENS") {
                return NextResponse.json<RepublishResponse>({
                    error: "INSUFFICIENT_CREDITS",
                    message: "Yetersiz Token",
                    cost: spendResult.cost,
                }, { status: 402 });
            }
            return NextResponse.json<RepublishResponse>({ error: spendResult.error }, { status: 400 });
        }

        // Reactivate logically
        const newDuration = await PackageSystem.getListingDuration(user.packageType);
        const expiresAt = new Date(Date.now() + newDuration * 24 * 60 * 60 * 1000);

        await prisma.guideListing.update({
            where: { id: listingId },
            data: {
                active: true,
                endDate: expiresAt,
            },
        });

        console.log(`[Republish] Listing ${listingId} republished. Cost: ${spendResult.cost}, Balance: ${spendResult.newBalance}`);

        return NextResponse.json<RepublishResponse>({
            success: true,
            message: "İlan yeniden yayınlandı",
            expiresAt: expiresAt.toISOString(),
            tokenBalance: spendResult.newBalance,
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Republish error:", error);
        return NextResponse.json<RepublishResponse>({ error: safeErrorMessage(error) }, { status: 500 });
    }
}
