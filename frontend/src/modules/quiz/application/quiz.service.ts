
import { prisma } from "@/lib/prisma";
import { TokenService } from "@/lib/token-service";
import { GUIDE_QUALIFICATION_QUESTIONS } from "../domain/question-bank";

export class QuizService {
    private static readonly PASSING_SCORE = 80; // %80 başarı sınırı
    private static readonly BONUS_TOKENS = 15;
    private static readonly COOLDOWN_HOURS = 24;

    static async canAttempt(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { packageType: true }
        });

        if (!user || user.packageType !== 'FREEMIUM') {
            return { allowed: false, reason: "Sadece Freemium kullanıcılar katılabilir." };
        }

        // Daha önce geçmiş mi?
        const alreadyPassed = await prisma.quizAttempt.findFirst({
            where: { userId, passed: true }
        });

        if (alreadyPassed) {
            return { allowed: false, reason: "Bu sınavı zaten başarıyla tamamladınız." };
        }

        // Son 24 saat içinde başarısız deneme var mı?
        const lastAttempt = await prisma.quizAttempt.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        if (lastAttempt) {
            const hoursSinceLastAttempt = (Date.now() - lastAttempt.createdAt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastAttempt < this.COOLDOWN_HOURS) {
                return { 
                    allowed: false, 
                    reason: `Tekrar denemek için ${Math.ceil(this.COOLDOWN_HOURS - hoursSinceLastAttempt)} saat beklemeniz gerekmektedir.` 
                };
            }
        }

        return { allowed: true };
    }

    static async submitAttempt(userId: string, userAnswers: { id: string, answerIndex: number }[]) {
        const check = await this.canAttempt(userId);
        if (!check.allowed) {
            throw new Error(check.reason);
        }

        let correctCount = 0;
        GUIDE_QUALIFICATION_QUESTIONS.forEach(q => {
            const userAns = userAnswers.find(ua => ua.id === q.id);
            if (userAns && userAns.answerIndex === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = (correctCount / GUIDE_QUALIFICATION_QUESTIONS.length) * 100;
        const passed = score >= this.PASSING_SCORE;

        const attempt = await prisma.$transaction(async (tx) => {
            const record = await tx.quizAttempt.create({
                data: {
                    userId,
                    score: Math.round(score),
                    passed
                }
            });

            // İlk kez geçtiyse jeton yükle
            if (passed) {
                await TokenService.grantCredits(
                    userId,
                    this.BONUS_TOKENS,
                    "admin",
                    "REHBER_YETERLILIK_BONUSU",
                    record.id,
                    `quiz_bonus:${userId}`
                );
            }

            return record;
        });

        return {
            score: attempt.score,
            passed: attempt.passed,
            bonusGranted: attempt.passed
        };
    }
}
