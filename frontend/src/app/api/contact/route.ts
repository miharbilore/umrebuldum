import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, phone, message } = body;

        if (!firstName || !lastName || !email || !message) {
            return NextResponse.json(
                { error: "Zorunlu alanlar eksik" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Geçersiz E-posta formatı" }, { status: 400 });
        }

        if (phone && !/^\d+$/.test(phone)) {
            return NextResponse.json({ error: "Geçersiz Telefon formatı (Sadece rakam)" }, { status: 400 });
        }

        if (message.length > 240) {
            return NextResponse.json({ error: "Mesaj en fazla 240 karakter olabilir" }, { status: 400 });
        }

        const fullName = `${firstName} ${lastName}`.trim();

        await prisma.contactMessage.create({
            data: {
                name: fullName,
                email,
                phone: phone || null,
                message,
            }
        });

        return NextResponse.json({ success: true, data: { name: fullName, email, phone, message } }, { status: 201 });
    } catch (error) {
        console.error("Contact Form Error:", error);
        return NextResponse.json(
            { error: "Mesaj gönderilirken bir hata oluştu" },
            { status: 500 }
        );
    }
}
