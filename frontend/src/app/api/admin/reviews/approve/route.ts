import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errors/api-handler";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { EventBus } from "@/core/events/event-bus";
import { ApprovalStatus } from "@prisma/client"; // Enum güvenliği eklendi

interface ApproveReviewPayload {
    reviewId: string;
    status: "APPROVED" | "REJECTED";
    reason?: string;
}

/**
 * POST /api/admin/reviews/approve
 * * Admin-only endpoint to approve or reject a pending review.
 * On approval, fires:
 * - REVIEW_APPROVED → Inngest rating-worker recalculates guide cache
 * - NOTIFICATION_CREATE → In-app notification to reviewer
 */
export const POST = withErrorHandler(async (req: Request) => {
    // ── Auth Guard ────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new AppError("Yetkisiz erişim", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const { reviewId, status, reason } = (await req.json()) as ApproveReviewPayload;

    // ── Validation ────────────────────────────────────────────────────
    if (!reviewId || !["APPROVED", "REJECTED"].includes(status)) {
        throw new AppError(
            "reviewId ve geçerli bir status (APPROVED/REJECTED) zorunludur.",
            ERROR_CODES.VALIDATION_ERROR,
            400
        );
    }

    // ── Fetch & Guard ─────────────────────────────────────────────────
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

    // ── Update Review ─────────────────────────────────────────────────
    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            status: status as ApprovalStatus, // String yerine güvenli Prisma Enum kullanıldı
            approvedAt: status === "APPROVED" ? new Date() : undefined,
        },
    });

    // ── Side Effects (Event-Driven) ───────────────────────────────────
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
        adminId: session.user.id,
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
