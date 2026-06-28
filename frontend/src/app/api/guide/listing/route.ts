import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";

interface ListingDeleteRequest {
    listingId: string;
}

interface ListingDeleteResponse {
    success?: boolean;
    message?: string;
    error?: string;
}

/**
 * DELETE /api/guide/listing — Soft-delete a guide's own listing
 */
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const { listingId } = (await req.json()) as ListingDeleteRequest;
        if (!listingId) return NextResponse.json<ListingDeleteResponse>({ error: "Missing listingId" }, { status: 400 });

        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json<ListingDeleteResponse>({ error: "User not found" }, { status: 404 });

        // Find listing and verify ownership
        const listing = await prisma.guideListing.findUnique({
            where: { id: listingId }
        });

        if (!listing) return NextResponse.json<ListingDeleteResponse>({ error: "Listing not found" }, { status: 404 });
        if (listing.guideId !== user.id) {
            return NextResponse.json<ListingDeleteResponse>({ error: "Not your listing" }, { status: 403 });
        }

        // Soft-delete
        await prisma.guideListing.update({
            where: { id: listingId },
            data: {
                active: false,
                deletedAt: new Date()
            }
        });

        return NextResponse.json<ListingDeleteResponse>({ success: true, message: `Listing ${listingId} deleted` });

    } catch (error: unknown) {
        console.error("Guide listing delete error:", error);
        let errorMessage = "Internal Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json<ListingDeleteResponse>({ error: errorMessage }, { status: 500 });
    }
}
