import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus } from "@prisma/client"; // Enum güvenliği için eklendi

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [pendingListings, pendingRequests, unreadMessages, pendingReviews] = await Promise.all([
            prisma.guideListing.count({
                where: { approvalStatus: ApprovalStatus.PENDING }, // String yerine Enum kullandık
            }),
            prisma.umrahRequest.count({
                where: { status: "open" }, // Bu şemada hala string, o yüzden sorun yok
            }),
            Promise.resolve(0), // contact_messages tablosu silindiği için frontend'e 0 dönüyoruz
            prisma.review.count({
                where: { status: ApprovalStatus.PENDING }, // String yerine Enum kullandık
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
