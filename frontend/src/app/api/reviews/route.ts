import { NextResponse } from "next/server";
import { CreateReviewUseCase } from "@/modules/reviews/application/CreateReviewUseCase";
import { ReviewRepository } from "@/modules/reviews/infrastructure/ReviewRepository";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/errors/api-handler";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";

/**
 * POST /api/reviews
 * 
 * Authenticated users submit a review for a guide they interacted with.
 * Review status starts as PENDING and requires admin approval.
 */
export const POST = withErrorHandler(async (req: Request) => {
    const session = await auth();
    if (!session?.user || !(session.user as any).id) {
        throw new AppError("Giriş yapmanız gerekiyor.", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const body = await req.json();
    const {
        guideId,
        requestId,
        ratingCommunication,
        ratingKnowledge,
        ratingOrganization,
        ratingTimeManagement,
        positiveTags,
        negativeTags,
        comment,
    } = body;

    if (!guideId || !requestId) {
        throw new AppError("guideId ve requestId zorunludur.", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const repo = new ReviewRepository();
    const useCase = new CreateReviewUseCase(repo);

    await useCase.execute({
        guideId,
        reviewerUserId: (session.user as any).id,
        requestId,
        ratingCommunication: Number(ratingCommunication),
        ratingKnowledge: Number(ratingKnowledge),
        ratingOrganization: Number(ratingOrganization),
        ratingTimeManagement: Number(ratingTimeManagement),
        positiveTags: positiveTags || [],
        negativeTags: negativeTags || [],
        comment,
        ipAddress,
        userAgent,
    });

    return NextResponse.json(
        { success: true, message: "Değerlendirmeniz başarıyla oluşturuldu." },
        { status: 201 }
    );
});

/**
 * GET /api/reviews?guideId=xxx&page=1&limit=10
 * 
 * Public: Returns APPROVED reviews for a specific guide with pagination.
 * Used by guide profile pages to show the trust signal.
 */
export const GET = withErrorHandler(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const guideId = searchParams.get("guideId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    if (!guideId) {
        throw new AppError("guideId parametresi zorunludur.", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: {
                guideId,
                status: "APPROVED",
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { approvedAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.review.count({
            where: {
                guideId,
                status: "APPROVED",
            },
        }),
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
