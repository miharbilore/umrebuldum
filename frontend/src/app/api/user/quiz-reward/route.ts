import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TokenService } from "@/lib/token-service";
import { differenceInHours } from "date-fns";
import { Prisma } from "@prisma/client";
import { withSerializableRetry } from "@/lib/with-retry";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "UNAUTHORIZED", message: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const { score } = await req.json();

        // 1. Strict Validation
        if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 10) {
            return NextResponse.json({ error: "INVALID_SCORE", message: "Geçersiz sınav puanı." }, { status: 400 });
        }

        const userId = session.user.id;

        // 2. Atomic Logic via Transaction with SERIALIZABLE isolation and Automated Retry (Senior Architect Fix)
        const result = await withSerializableRetry(async () => {
            return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Fetch fresh state inside transaction
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        quizAttempts: true,
                        hasCompletedQuiz: true,
                        lastQuizAttempt: true,
                        tokenBalance: true
                    }
                });

                if (!user) throw new Error("USER_NOT_FOUND");

                // Eligibility checks
                if (user.hasCompletedQuiz) throw new Error("QUIZ_ALREADY_COMPLETED");
                if (user.quizAttempts >= 3) throw new Error("MAX_ATTEMPTS_REACHED");

                if (user.lastQuizAttempt) {
                    const hoursSinceLast = differenceInHours(new Date(), user.lastQuizAttempt);
                    if (hoursSinceLast < 24) throw new Error("COOLDOWN_ACTIVE");
                }

                const isPassed = score >= 7;
                const newAttemptCount = user.quizAttempts + 1;

                // Update user state first
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        quizAttempts: newAttemptCount,
                        lastQuizAttempt: new Date(),
                        hasCompletedQuiz: isPassed
                    }
                });

                let finalBalance = user.tokenBalance;

                if (isPassed) {
                    // Pass current transaction client 'tx' for real atomic ledger entry
                    finalBalance = await TokenService.grantCredits(
                        userId,
                        15,
                        "admin",
                        "QUIZ_REWARD",
                        undefined,
                        `quiz_reward_${userId}_${newAttemptCount}`,
                        tx
                    );
                }

                return { isPassed, attemptsLeft: 3 - newAttemptCount, finalBalance };
            }, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable
            });
        });

        return NextResponse.json({ 
            success: true,
            message: result.isPassed ? "Tebrikler! Sınavı başarıyla geçtiniz." : "Sınav tamamlandı.",
            isPassed: result.isPassed, 
            score, 
            attemptsLeft: result.attemptsLeft,
            newBalance: result.finalBalance 
        });

    } catch (error: any) {
        // Map specific errors to correct HTTP status and localized messages
        if (error.message === "USER_NOT_FOUND") {
            return NextResponse.json({ error: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı." }, { status: 404 });
        }
        if (error.message === "QUIZ_ALREADY_COMPLETED") {
            return NextResponse.json({ error: "QUIZ_ALREADY_COMPLETED", message: "Ödülü zaten aldınız." }, { status: 400 });
        }
        if (error.message === "MAX_ATTEMPTS_REACHED") {
            return NextResponse.json({ error: "MAX_ATTEMPTS_REACHED", message: "3 deneme hakkınızı da kullandınız." }, { status: 400 });
        }
        if (error.message === "COOLDOWN_ACTIVE") {
            return NextResponse.json({ error: "COOLDOWN_ACTIVE", message: "Tekrar denemek için 24 saat beklemelisiniz." }, { status: 400 });
        }

        console.error("Quiz reward API error:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR", message: "Beklenmedik bir hata oluştu." }, { status: 500 });
    }
}
