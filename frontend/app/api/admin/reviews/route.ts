import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errors/api-handler";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";

/**
 * GET /api/admin/reviews
 * 
 * Admin-only: Lists reviews filtered by status with pagination.
 * Query params:
 *   - status: "PENDING" | "APPROVED" | "REJECTED" (default: "PENDING")
 *   - page: number (default: 1)
 *   - limit: number (default: 10)
 */
export const GET = withErrorHandler(async (req: Request) => {
    // ── Auth Guard ────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new AppError("Yetkisiz erişim", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const status = searchParams.get("status") || "PENDING";

    // Validate status
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        throw new AppError(
            "Geçersiz status parametresi. PENDING, APPROVED veya REJECTED olmalı.",
            ERROR_CODES.VALIDATION_ERROR,
            400
        );
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { status },
            include: {
                reviewer: {
                    select: { id: true, name: true, email: true, image: true },
                },
                guide: {
                    select: { id: true, name: true, email: true, image: true },
                },
                request: {
                    select: { id: true, departureCity: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.review.count({ where: { status } }),
    ]);

    return NextResponse.json({
        data: reviews,
        metadata: {
            totalCount: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit,
        },
    });
});
