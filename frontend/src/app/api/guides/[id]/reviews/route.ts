import { NextRequest, NextResponse } from "next/server";
import { GetGuideReviewsQuery } from "@/modules/reviews/application/GetGuideReviewsQuery";

interface ReviewsResponse {
    success?: boolean;
    data?: unknown;
    error?: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json<ReviewsResponse>({ error: "Kılavuz kimliği eksik." }, { status: 400 });
        }

        const query = new GetGuideReviewsQuery();
        const stats = await query.execute(id);

        return NextResponse.json<ReviewsResponse>({ success: true, data: stats });
    } catch (error: unknown) {
        console.error("[GET /api/guides/[id]/reviews] Error:", error);
        return NextResponse.json<ReviewsResponse>({ error: "Sunucu hatası." }, { status: 500 });
    }
}
