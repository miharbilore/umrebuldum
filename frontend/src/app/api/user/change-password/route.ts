import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword?: string;
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const body = (await req.json()) as ChangePasswordRequest;
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı veya şifre belirlenmemiş (Sosyal giriş kullanıyor olabilirsiniz)." }, { status: 404 });
        }

        // Verify old password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Mevcut şifreniz hatalı." }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "Şifreniz güncellendi." });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Change password error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("Change password error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
