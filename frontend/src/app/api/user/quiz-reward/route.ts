import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TokenService } from "@/lib/token-service";
import { differenceInHours } from "date-fns";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { score } = await req.json();

        if (typeof score !== 'number') {
            return NextResponse.json({ error: "Invalid score" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Eligibility checks
        if (user.hasCompletedQuiz) {
            return NextResponse.json({ 
                error: "QUIZ_ALREADY_COMPLETED", 
                message: "Sınavı zaten başarıyla tamamladınız. Tokenlar hesabınıza eklendi." 
            }, { status: 400 });
        }

        if (user.quizAttempts >= 3) {
            return NextResponse.json({ 
                error: "MAX_ATTEMPTS_REACHED", 
                message: "Maksimum sınav deneme sınırına (3/3) ulaştınız. Teşekkür ederiz." 
            }, { status: 400 });
        }

        if (user.lastQuizAttempt) {
            const hoursSinceLast = differenceInHours(new Date(), user.lastQuizAttempt);
            if (hoursSinceLast < 24) {
                return NextResponse.json({ 
                    error: "COOLDOWN_ACTIVE", 
                    message: `Tekrar denemek için ${24 - hoursSinceLast} saat beklemelisiniz.` 
                }, { status: 400 });
            }
        }

        // Process attempt
        const updatedAttempts = user.quizAttempts + 1;
        const isPassed = score >= 7;

        let newBalance = user.tokenBalance;

        if (isPassed) {
            // Grant reward
            newBalance = await TokenService.grantCredits(
                user.id,
                15,
                "admin",
                "QUIZ_REWARD",
                undefined,
                `quiz_reward_${user.id}_${updatedAttempts}` // Idempotency
            );
        }

        // Update user state
        await prisma.user.update({
            where: { id: user.id },
            data: {
                quizAttempts: updatedAttempts,
                lastQuizAttempt: new Date(),
                hasCompletedQuiz: isPassed,
            }
        });

        return NextResponse.json({ 
            success: true, 
            isPassed, 
            score, 
            attemptsLeft: 3 - updatedAttempts,
            newBalance 
        });

    } catch (error) {
        console.error("Quiz reward API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
