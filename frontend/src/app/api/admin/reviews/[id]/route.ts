import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ModerateReviewUseCase } from "@/modules/reviews/application/ModerateReviewUseCase";

interface ModerateReviewPayload {
    action: "APPROVE" | "REJECT";
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Only ADMIN should access this
        const session = await auth();
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { action } = (await req.json()) as ModerateReviewPayload;

        if (!id || (action !== "APPROVE" && action !== "REJECT")) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        const useCase = new ModerateReviewUseCase();
        await useCase.execute(id, action);

        return NextResponse.json({ success: true, message: `Review ${action.toLowerCase()}d successfully.` });
    } catch (error: unknown) {
        console.error(`[PATCH /api/admin/reviews/[id]] Error:`, error instanceof Error ? error.message : error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
    }
}
