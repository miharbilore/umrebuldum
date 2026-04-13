import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { AuthRateLimit } from "@/lib/auth-rate-limit";
import { emailService } from "@/lib/email/email-service";
import { passwordResetTemplate } from "@/lib/email/email-templates";

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const body = await req.json();
        const { email } = body;

        const lockout = await AuthRateLimit.checkLockout(ip, email);
        if (!lockout.allowed) {
            return NextResponse.json({ error: lockout.reason || "Too many attempts." }, { status: 429 });
        }

        if (!email) {
            await AuthRateLimit.recordFailure(ip, email);
            return NextResponse.json({ error: "E-posta adresi gereklidir." }, { status: 400 });
        }

        // Always return success to prevent email enumeration
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Generate a secure token
            const token = randomBytes(32).toString("hex");
            // const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // GEÇİCİ OLARAK KAPATILDI: verificationToken tablosu şemadan silindiği için build patlıyordu.
            // İleride şifre sıfırlama için JWT mantığına geçilecek veya yeni tablo eklenecek.
            /*
            await prisma.verificationToken.deleteMany({
                where: { identifier: email },
            });

            await prisma.verificationToken.create({
                data: {
                    identifier: email,
                    token,
                    expires,
                },
            });
            */

            // Build reset URL
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

            // Development: log to console only (no file writes)
            console.log("â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€");
            console.log(`Password Reset Link for ${email}:`);
            console.log(resetUrl);
            console.log("â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€");

            // Send password reset email (non-blocking)
            emailService.sendAsync(
                email,
                passwordResetTemplate({ resetUrl, email })
            );
        }

        await AuthRateLimit.recordSuccess(ip, email);

        // Always return success (security: don't reveal if email exists)
        return NextResponse.json({
            success: true,
            message: "E-posta adresinize şifre sıfırlama bağlantısı gönderildi.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
