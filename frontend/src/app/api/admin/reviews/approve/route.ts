import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errors/api-handler";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { EventBus } from "@/core/events/event-bus";
import { ApprovalStatus } from "@prisma/client"; // Enum güvenliği eklendi

/**
 * POST /api/admin/reviews/approve
 * * Admin-only endpoint to approve or reject a pending review.
 * On approval, fires:
 * - REVIEW_APPROVED â†’ Inngest rating-worker recalculates guide cache
 * - NOTIFICATION_CREATE â†’ In-app notification to reviewer
 */
export const POST = withErrorHandler(async (req: Request) => {
    // â”€â”€ Auth Guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new AppError("Yetkisiz erişim", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const body = await req.json();
    const { reviewId, status, reason } = body;

    // â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!reviewId || !["APPROVED", "REJECTED"].includes(status)) {
        throw new AppError(
            "reviewId ve geçerli bir status (APPROVED/REJECTED) zorunludur.",
            ERROR_CODES.VALIDATION_ERROR,
            400
        );
    }

    // â”€â”€ Fetch & Guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { id: true, guideId: true, status: true, reviewerUserId: true },
    });

    if (!review) {
        throw new AppError("Yorum bulunamadı.", ERROR_CODES.NOT_FOUND, 404);
    }

    if (review.status === status) {
        throw new AppError("Yorum zaten bu durumda.", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // â”€â”€ Update Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            status: status as ApprovalStatus, // String yerine güvenli Prisma Enum kullanıldı
            approvedAt: status === "APPROVED" ? new Date() : undefined,
        },
    });

    // â”€â”€ Side Effects (Event-Driven) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (status === "APPROVED") {
        // Fire background worker to recalculate guide's average rating
        await EventBus.emit("REVIEW_APPROVED", {
            reviewId: updatedReview.id,
            guideId: updatedReview.guideId,
        });

        // Notify the reviewer that their review is live
        await EventBus.emit("NOTIFICATION_CREATE", {
            userId: updatedReview.reviewerUserId,
            type: "IN_APP",
            title: "Yorumunuz Onaylandı",
            message: "Yaptığınız rehber değerlendirmesi yayına alındı. Teşekkür ederiz!",
        });
    }

    // Audit log tablosu silindiği için sistemi çökertmemek adına konsola logluyoruz
    console.log("Admin Action Logged:", {
        adminId: (session.user as any).id,
        action: status === "APPROVED" ? "approve_review" : "reject_review",
        targetId: reviewId,
        reason: reason || `Review ${status.toLowerCase()} by admin`,
        metadata: { guideId: review.guideId, reviewerUserId: review.reviewerUserId },
    });

    return NextResponse.json({
        success: true,
        message: `Yorum başarıyla ${status === "APPROVED" ? "onaylandı" : "reddedildi"}.`,
        review: updatedReview,
    });
});
