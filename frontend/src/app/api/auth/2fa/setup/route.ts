import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, twoFactorSecret: true, isTwoFactorEnabled: true, email: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let secret = user.twoFactorSecret;
        
        // Generate new secret if one doesn't exist
        if (!secret) {
            const { generateSecret } = await import("otplib");
            secret = generateSecret();
            await prisma.user.update({
                where: { id: user.id },
                data: { twoFactorSecret: secret }
            });
        }

        // Generate otpauth URL manually to avoid library mismatches
        const otpauthUrl = `otpauth://totp/Umrebuldum:${encodeURIComponent(user.email || 'user')}?secret=${secret}&issuer=Umrebuldum`;

        // Generate QR code base64
        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

        return NextResponse.json({
            qrCodeUrl,
            isEnabled: user.isTwoFactorEnabled
        });
    } catch (error) {
        console.error("GET 2FA Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { totpCode } = body;

        if (!totpCode || typeof totpCode !== 'string') {
            return NextResponse.json({ error: "Missing TOTP code" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, twoFactorSecret: true }
        });

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: "2FA setup not initialized" }, { status: 400 });
        }

        const { verify } = await import("otplib");

        // Verify the code
        const isValid = verify({
            token: totpCode,
            secret: user.twoFactorSecret
        });

        if (!isValid) {
            return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
        }

        // Enable 2FA for the user
        await prisma.user.update({
            where: { id: user.id },
            data: { isTwoFactorEnabled: true }
        });

        return NextResponse.json({ success: true, message: "2FA is now enabled" });

    } catch (error) {
        console.error("POST 2FA Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
