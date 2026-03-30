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
            const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Delete any existing reset tokens for this email
            await prisma.verificationToken.deleteMany({
                where: { identifier: email },
            });

            // Store the reset token
            await prisma.verificationToken.create({
                data: {
                    identifier: email,
                    token,
                    expires,
                },
            });

            // Build reset URL
            const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
            const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

            // In development: log to console + save to file
            console.log("──────────────────────────────────────────────");
            console.log(`Password Reset Link for ${email}:`);
            console.log(resetUrl);
            console.log("──────────────────────────────────────────────");

            if (process.env.NODE_ENV === "development") {
                try {
                    const fs = require("fs");
                    const path = require("path");
                    const dataDir = path.join(process.cwd(), "data");
                    if (!fs.existsSync(dataDir)) {
                        fs.mkdirSync(dataDir, { recursive: true });
                    }
                    const filePath = path.join(dataDir, "dev-reset.json");
                    fs.writeFileSync(
                        filePath,
                        JSON.stringify({
                            email,
                            token,
                            resetUrl,
                            timestamp: new Date().toISOString(),
                        })
                    );
                } catch (_error) {
                    console.error("Failed to save dev reset link:", _error);
                }
            }

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
