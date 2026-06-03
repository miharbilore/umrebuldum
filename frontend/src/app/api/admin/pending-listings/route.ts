import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { ApprovalStatus } from "../../../../../prisma/generated-client"; // Enum güvenliği eklendi

export async function GET() {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const listings = await prisma.guideListing.findMany({
            where: { approvalStatus: ApprovalStatus.PENDING }, // String yerine Enum kullanıldı
            include: {
                guide: {
                    include: {
                        // DOĞRU: fullName ve trustScore artık User tablosundan çekiliyor
                        user: { select: { name: true, fullName: true, email: true, trustScore: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const result = listings.map((l) => ({
            id: l.id,
            title: l.title,
            // DOĞRU: Veri user altından okunuyor
            guideName: l.guide?.user?.fullName || l.guide?.user?.name || "—",
            guideEmail: l.guide?.user?.email || "—",
            // DOĞRU: Eski price silindi, Decimal alan Number'a çevrildi
            price: Number(l.pricingQuad || l.pricingDouble || 0),
            createdAt: l.createdAt,
            // DOĞRU: trustScore user altından okunuyor
            trustScore: l.guide?.user?.trustScore ?? 0,
            isFeatured: l.isFeatured,
            departureCityId: l.departureCityId,
            city: l.city,
        }));

        return NextResponse.json({ listings: result });
    } catch (error) {
        console.error("Admin pending-listings error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
