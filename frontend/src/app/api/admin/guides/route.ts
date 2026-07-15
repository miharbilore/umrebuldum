import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/errors/api-handler";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { EventBus } from "@/core/events/event-bus";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-guards";

// 1. Fetch pending guide approvals
export const GET = withErrorHandler(async (req: Request) => {
    const session = await auth();
    const guard = requireAdmin(session);
    if (guard) return guard;

    // Note: Middleware already protects this path to ADMIN

    const pendingGuides = await prisma.user.findMany({
        where: {
            role: "USER", // Usually they sign up as USER, and await approval
            isIdentityVerified: false,
            guideProfile: { isNot: null } // They created a profile but waiting for identity check
        },
        include: {
            guideProfile: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return NextResponse.json({
        success: true,
        data: pendingGuides
    });
});

interface ApproveGuideRequest {
    userId: string;
    action: "APPROVE" | "REJECT";
}

// 2. Approve Guide
export const POST = withErrorHandler(async (req: Request) => {
    const session = await auth();
    const guard = requireAdmin(session);
    if (guard) return guard;

    const body = (await req.json()) as ApproveGuideRequest;
    const { userId, action } = body;

    if (!userId || !action) {
        throw new AppError("Geçersiz istek.", ERROR_CODES.INVALID_QUERY, 400);
    }

    if (action === "APPROVE") {
        // Update User & fırlat event
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: "GUIDE",
                isIdentityVerified: true
            }
        });

        // Background Job trigger
        await EventBus.emit("IDENTITY_APPROVED", { userId });

        return NextResponse.json({
            success: true,
            message: "Rehber başarıyla onaylandı ve hesabı aktif edildi."
        });
    }

    if (action === "REJECT") {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isIdentityVerified: false
                // They stay as USER
            }
        });

        await EventBus.emit("IDENTITY_REVOKED", { userId });

        return NextResponse.json({
            success: true,
            message: "Rehber başvurusu reddedildi."
        });
    }

    throw new AppError("Geçersiz eylem.", ERROR_CODES.INVALID_QUERY, 400);
});
