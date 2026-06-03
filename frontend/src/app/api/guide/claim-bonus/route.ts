import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { grantToken } from "@/modules/tokens/application/grant-token.usecase";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { bonusType } = body;

        if (bonusType !== "QUIZ" && bonusType !== "PROFILE") {
            return NextResponse.json({ error: "Geçersiz bonus tipi." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { 
                id: true, 
                quizPassed: true, 
                hasClaimedQuizBonus: true, 
                profileCompletedAt: true, 
                hasClaimedProfileBonus: true 
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
        }

        let amount = 0;

        // ── Business Rules & Validation ─────────────────────────────────
        if (bonusType === "QUIZ") {
            if (user.hasClaimedQuizBonus) {
                return NextResponse.json({ error: "Bu bonusu zaten aldınız." }, { status: 400 });
            }
            if (!user.quizPassed) {
                return NextResponse.json({ error: "Önce Umre Quiz'ini başarıyla geçmelisiniz." }, { status: 400 });
            }
            amount = 10;
        } else if (bonusType === "PROFILE") {
            if (user.hasClaimedProfileBonus) {
                return NextResponse.json({ error: "Bu bonusu zaten aldınız." }, { status: 400 });
            }
            if (!user.profileCompletedAt) {
                return NextResponse.json({ error: "Önce profilinizi %100 tamamlamalısınız." }, { status: 400 });
            }
            amount = 5;
        }

        // ── Atomic Transaction ──────────────────────────────────────────
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the claim flag
            await tx.user.update({
                where: { id: user.id },
                data: bonusType === "QUIZ" 
                    ? { hasClaimedQuizBonus: true }
                    : { hasClaimedProfileBonus: true }
            });

            // 2. Grant tokens & log to ledger
            return await grantToken({
                userId: user.id,
                amount,
                type: "ADMIN_GRANT", // Promotional/Bonus type
                reason: `${bonusType} tamamlama bonusu`,
                idempotencyKey: `claim_bonus_${bonusType}_${user.id}`,
                tx,
            });
        });

        return NextResponse.json({ 
            message: "Bonus başarıyla eklendi.", 
            newBalance: result.newBalance 
        }, { status: 200 });

    } catch (error: any) {
        console.error("Claim bonus error:", error);
        return NextResponse.json({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
    }
}
