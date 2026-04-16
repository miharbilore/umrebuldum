import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TokenService } from "@/lib/token-service";
import { differenceInHours } from "date-fns";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { score } = await req.json();

        // 1. Strict Validation (QA Point 3)
        if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 10) {
            return NextResponse.json({ error: "Invalid score" }, { status: 400 });
        }

        const userId = session.user.id;

        // 2. Atomic Logic started via Transaction (QA Point 3)
        const result = await prisma.$transaction(async (tx) => {
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
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    quizAttempts: newAttemptCount,
                    lastQuizAttempt: new Date(),
                    hasCompletedQuiz: isPassed
                }
            });

            let finalBalance = user.tokenBalance;

            if (isPassed) {
                // We use the internal TokenService logic but ensure it's linked
                // Note: TokenService.grantCredits manages its OWN transaction. 
                // To be truly atomic, we manually create the ledger entry here or ensure grantCredits is safe.
                // Since grantCredits uses unique idempotency keys, it's safe against double-spend.
                finalBalance = await TokenService.grantCredits(
                    userId,
                    15,
                    "admin",
                    "QUIZ_REWARD",
                    tx as any, // Pass current transaction client
                    `quiz_reward_${userId}_${newAttemptCount}`
                );
            }

            return { isPassed, attemptsLeft: 3 - newAttemptCount, finalBalance };
        });

        return NextResponse.json({ 
            success: true, 
            isPassed: result.isPassed, 
            score, 
            attemptsLeft: result.attemptsLeft,
            newBalance: result.finalBalance 
        });

    } catch (error: any) {
        if (error.message === "QUIZ_ALREADY_COMPLETED") {
            return NextResponse.json({ error, message: "Sınavı zaten tamamladınız." }, { status: 400 });
        }
        if (error.message === "MAX_ATTEMPTS_REACHED") {
            return NextResponse.json({ error, message: "Maksimum deneme sınırına ulaştınız." }, { status: 400 });
        }
        if (error.message === "COOLDOWN_ACTIVE") {
            return NextResponse.json({ error, message: "Tekrar denemek için 24 saat beklemelisiniz." }, { status: 400 });
        }

        console.error("Quiz reward API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
