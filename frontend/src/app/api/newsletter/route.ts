import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const newsletterSchema = z.object({
    email: z.string()
        .email("Geçerli bir e-posta adresi giriniz.")
        .max(254, "E-posta adresi çok uzun.")
        .transform((e) => e.toLowerCase().trim()),
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const { success } = await rateLimit(`newsletter:${ip}`, 60_000, 5);
        if (!success) {
            return NextResponse.json(
                { error: "Çok fazla istek. Lütfen bir dakika sonra tekrar deneyin." },
                { status: 429 }
            );
        }

        const rawBody = await request.json();
        const validation = newsletterSchema.safeParse(rawBody);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }
        const { email } = validation.data;

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
