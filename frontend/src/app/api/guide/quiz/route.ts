
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAuth } from '@/lib/api-guards';
import { QuizService } from '@/modules/quiz/application/quiz.service';
import { GUIDE_QUALIFICATION_QUESTIONS } from '@/modules/quiz/domain/question-bank';

export async function GET() {
    const session = await auth();
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    try {
        const canAttempt = await QuizService.canAttempt(session!.user.id!);
        
        // Security: Mask correct answers before sending to client
        const safeQuestions = GUIDE_QUALIFICATION_QUESTIONS.map(({ correctAnswer, ...rest }) => rest);

        return NextResponse.json({
            canAttempt: canAttempt.allowed,
            reason: canAttempt.allowed ? null : canAttempt.reason,
            questions: safeQuestions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    try {
        const body = await req.json();
        const { answers } = body;

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json({ error: "Geçersiz yanıt formatı." }, { status: 400 });
        }

        const result = await QuizService.submitAttempt(session!.user.id!, answers);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ 
            error: error.message || "Sanal zeka motoru sınavı değerlendiremedi." 
        }, { status: 400 });
    }
}
