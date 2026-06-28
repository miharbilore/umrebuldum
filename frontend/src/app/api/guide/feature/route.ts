import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";
import { spendToken } from "@/modules/tokens/application/spend-token.usecase";
import { TOKEN_COSTS } from "@/lib/package-system";
import { rateLimit } from "@/lib/rate-limit";

const MAX_FEATURED_LISTINGS = 3;

interface FeatureRequest {
    listingId: string;
}

interface FeatureResponse {
    message?: string;
    error?: string;
    credits?: number;
    balance?: number;
    success?: boolean;
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const { listingId } = (await req.json()) as FeatureRequest;
        if (!listingId) return NextResponse.json<FeatureResponse>({ error: "Missing listingId" }, { status: 400 });

        // Rate limit: 3 feature requests per minute
        const rl = await rateLimit(`feature:${session!.user.email}`, 60_000, 3);
        if (!rl.success) {
            return NextResponse.json<FeatureResponse>({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json<FeatureResponse>({ error: "User not found" }, { status: 404 });

        // ─── Feature Cap: Max 3 featured listings per GUIDE/ORG ───
        const featuredCount = await prisma.guideListing.count({
            where: {
                guideId: user.id,
                isFeatured: true,
                active: true
            }
        });

        if (featuredCount >= MAX_FEATURED_LISTINGS) {
            return NextResponse.json<FeatureResponse>({
                error: "FEATURE_CAP_REACHED",
                message: `En fazla ${MAX_FEATURED_LISTINGS} ilan öne çıkarılabilir.`
            }, { status: 400 });
        }

        // Find listing and verify ownership + eligibility
        const listing = await prisma.guideListing.findUnique({
            where: { id: listingId }
        });
        if (!listing) return NextResponse.json<FeatureResponse>({ error: "Listing not found" }, { status: 404 });
        if (listing.guideId !== user.id) {
            return NextResponse.json<FeatureResponse>({ error: "Unauthorized access to listing" }, { status: 403 });
        }
        if (listing.isFeatured) {
            return NextResponse.json<FeatureResponse>({ message: "Listing is already featured" }, { status: 200 });
        }
        if (listing.approvalStatus !== 'APPROVED') {
            return NextResponse.json<FeatureResponse>({ error: "Only approved listings can be featured" }, { status: 400 });
        }

        const spendResult = await spendToken({
            userId: user.id,
            action: "BOOST",
            relatedId: listingId,
            reason: `Feature listing: ${listing.title}`,
        });

        if (!spendResult.ok) {
            if (spendResult.error === "INSUFFICIENT_TOKENS") {
                return NextResponse.json<FeatureResponse>({
                    error: "INSUFFICIENT_CREDITS",
                    message: "Yetersiz Kredi",
                    balance: spendResult.newBalance,
                }, { status: 402 });
            }
            return NextResponse.json<FeatureResponse>({ error: spendResult.error }, { status: 400 });
        }

        // ─── Feature the listing (post-spend) ───
        await prisma.guideListing.update({
            where: { id: listingId },
            data: { isFeatured: true }
        });

        return NextResponse.json<FeatureResponse>({
            message: "Listing featured successfully",
            credits: spendResult.newBalance
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Feature listing error:", error);
        let errorMessage = "Internal Server Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json<FeatureResponse>({ error: errorMessage }, { status: 500 });
    }
}

/**
 * DELETE — De-feature a listing (no refund, just toggle off)
 */
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const { listingId } = (await req.json()) as FeatureRequest;
        if (!listingId) return NextResponse.json<FeatureResponse>({ error: "Missing listingId" }, { status: 400 });

        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json<FeatureResponse>({ error: "User not found" }, { status: 404 });

        const listing = await prisma.guideListing.findUnique({
            where: { id: listingId }
        });
        if (!listing) return NextResponse.json<FeatureResponse>({ error: "Listing not found" }, { status: 404 });
        if (listing.guideId !== user.id) {
            return NextResponse.json<FeatureResponse>({ error: "Not your listing" }, { status: 403 });
        }

        if (!listing.isFeatured) {
            return NextResponse.json<FeatureResponse>({ message: "Listing is not featured" }, { status: 200 });
        }

        await prisma.guideListing.update({
            where: { id: listingId },
            data: { isFeatured: false }
        });

        return NextResponse.json<FeatureResponse>({
            success: true,
            message: "Listing de-featured"
        });

    } catch (error: unknown) {
        console.error("De-feature listing error:", error);
        let errorMessage = "Internal Server Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json<FeatureResponse>({ error: errorMessage }, { status: 500 });
    }
}
