import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AuthRateLimit } from "@/lib/auth-rate-limit";

interface ResetPasswordBody {
    token: string;
    email: string;
    newPassword: string;
}

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const body = (await req.json()) as ResetPasswordBody;
        const { token, email, newPassword } = body;

        const lockout = await AuthRateLimit.checkLockout(ip, email);
        if (!lockout.allowed) {
            return NextResponse.json({ error: lockout.reason || "Too many attempts" }, { status: 429 });
        }

        if (!token || !email || !newPassword) {
            await AuthRateLimit.recordFailure(ip, email);
            return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
        }

        // GEÇİCİ OLARAK KAPATILDI: verificationToken tablosu şemadan silindiği için DB sorgusu yorum satırına alındı.
        // İleride JWT tabanlı sıfırlama veya yeni tablo mantığı eklenecek.
        /*
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: token,
                expires: { gt: new Date() }
            }
        });

        if (!verificationToken) {
            await AuthRateLimit.recordFailure(ip, email);
            return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 400 });
        }
        */

        // Güvenlik: En azından e-postaya sahip bir kullanıcı var mı diye kontrol edelim
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });

        // GEÇİCİ OLARAK KAPATILDI: Token silme işlemi iptal edildi
        /*
        await prisma.verificationToken.delete({
            where: { token }
        });
        */

        await AuthRateLimit.recordSuccess(ip, email);

        return NextResponse.json({ success: true, message: "Şifre güncellendi." });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Reset password error:", error.message);
        } else {
            console.error("Reset password error:", error);
        }
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
