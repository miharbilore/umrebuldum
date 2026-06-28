
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { logAdminAction } from "@/lib/admin-audit";

interface CompleteTripRequest {
    listingId: string;
}

interface CompleteTripResponse {
    message?: string;
    listingId?: string;
    error?: string;
}

/**
 * ADMIN-ONLY: Mark a trip as completed for a guide.
 * Requires listingId. Idempotent — cannot complete same listing twice.
 */
export async function PUT(req: Request) {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const data = (await req.json()) as CompleteTripRequest;
        const { listingId } = data;
        if (!listingId) {
            return NextResponse.json<CompleteTripResponse>({ error: "Missing listingId" }, { status: 400 });
        }

        const listing = await prisma.guideListing.findUnique({
            where: { id: listingId },
            include: { guide: true }
        });
        if (!listing) {
            return NextResponse.json<CompleteTripResponse>({ error: "Listing not found" }, { status: 404 });
        }

        if (listing.urgencyTag === 'TRIP_COMPLETED') {
            return NextResponse.json<CompleteTripResponse>({ message: "Trip already marked as completed" }, { status: 200 });
        }

        // Mark listing as completed + increment guide stats
        await prisma.$transaction([
            prisma.guideListing.update({
                where: { id: listingId },
                data: { urgencyTag: 'TRIP_COMPLETED' }
            }),
            prisma.user.update({
                where: { id: listing.guideId },
                data: {
                    trustScore: { increment: 1 },
                    completedTrips: { increment: 1 }
                }
            })
        ]);

        // Audit log
        const adminUser = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (adminUser) {
            await logAdminAction(
                adminUser.id,
                "complete_trip",
                listingId,
                `Trip completed for listing: ${listing.title}`,
                { guideId: listing.guideId }
            );
        }

        return NextResponse.json<CompleteTripResponse>({
            message: "Trip completed recorded",
            listingId
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Complete trip error:", error);
        let errorMessage = "Internal Server Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json<CompleteTripResponse>({ error: errorMessage }, { status: 500 });
    }
}
