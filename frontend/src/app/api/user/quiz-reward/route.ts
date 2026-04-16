import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TokenService } from "@/lib/token-service";
import { differenceInHours } from "date-fns";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }

        const { score } = await req.json();

        // 1. Strict Validation
        if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 10) {
            return NextResponse.json({ error: "INVALID_SCORE" }, { status: 400 });
        }

        const userId = session.user.id;

        // 2. Atomic Logic via Transaction
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
                // Pass current transaction client 'tx' as the last argument (7th)
                finalBalance = await TokenService.grantCredits(
                    userId,
                    15,
                    "admin",
                    "QUIZ_REWARD",
                    undefined, // relatedId
                    `quiz_reward_${userId}_${newAttemptCount}`, // idempotencyKey
                    tx as any // Transaction Client
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
        // Map specific errors to correct HTTP status and clean string codes
        if (error.message === "USER_NOT_FOUND") {
            return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
        }
        if (error.message === "QUIZ_ALREADY_COMPLETED") {
            return NextResponse.json({ error: "QUIZ_ALREADY_COMPLETED" }, { status: 400 });
        }
        if (error.message === "MAX_ATTEMPTS_REACHED") {
            return NextResponse.json({ error: "MAX_ATTEMPTS_REACHED" }, { status: 400 });
        }
        if (error.message === "COOLDOWN_ACTIVE") {
            return NextResponse.json({ error: "COOLDOWN_ACTIVE" }, { status: 400 });
        }

        console.error("Quiz reward API error:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}
