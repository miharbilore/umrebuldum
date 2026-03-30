import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [pendingListings, pendingRequests, unreadMessages, pendingReviews] = await Promise.all([
            prisma.guideListing.count({
                where: { approvalStatus: "PENDING" },
            }),
            prisma.umrahRequest.count({
                where: { status: "open" }, // Assuming open means it needs attention
            }),
            prisma.contactMessage.count({
                where: { status: "NEW" },
            }),
            prisma.review.count({
                where: { status: "PENDING" },
            }),
        ]);

        return NextResponse.json({
            pendingListings,
            pendingRequests,
            unreadMessages,
            pendingReviews,
        });
    } catch (error) {
        console.error("Admin Counts API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
