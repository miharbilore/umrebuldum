import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 });
        }

        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existing) {
            if (!existing.isActive) {
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: { isActive: true },
                });
                return NextResponse.json({ message: "Bülten aboneliğiniz tekrar aktifleştirildi." });
            }
            return NextResponse.json({ message: "Zaten bültene abonesiniz." });
        }

        await prisma.newsletterSubscriber.create({
            data: { email },
        });

        return NextResponse.json({ message: "Bültenimize başarıyla abone oldunuz." }, { status: 201 });
    } catch (error) {
        console.error("Newsletter subscription error:", error);
        return NextResponse.json({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
    }
}
