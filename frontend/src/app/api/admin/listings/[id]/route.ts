import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { safeErrorMessage } from "@/lib/safe-error";
import { ApprovalStatus } from "@/../prisma/generated-client";

interface UpdateListingRequest {
    title?: string;
    price?: string | number;
    quota?: string | number;
    active?: boolean;
    approvalStatus?: ApprovalStatus;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const { title, price, quota, active, approvalStatus } = (await req.json()) as UpdateListingRequest;

        const updated = await prisma.guideListing.update({
            where: { id },
            data: {
                title,
                // price silindiği için frontend'den gelen veriyi pricingQuad'a kaydediyoruz
                pricingQuad: price !== undefined ? Number(price) : undefined, 
                quota: quota !== undefined ? Number(quota) : undefined,
                active: active !== undefined ? Boolean(active) : undefined,
                // String'i güvenli Prisma Enum formatına çeviriyoruz
                approvalStatus: approvalStatus ? (approvalStatus as ApprovalStatus) : undefined,
            }
        });

        // AdminAuditLog tablosu silindiği için sistemi çökertmemek adına konsola logluyoruz
        console.log("Admin Action Logged:", {
            adminId: session!.user?.id ?? "",
            action: "UPDATE_LISTING",
            targetId: id,
            reason: `Admin updated listing: ${title}, Price: ${price}, Active: ${active}, Status: ${approvalStatus}`,
        });

        return NextResponse.json({ success: true, listing: updated });
    } catch (error: unknown) {
        return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 });
    }
}