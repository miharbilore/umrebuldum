import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ContactRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message: string;
}

interface ContactResponse {
    success?: boolean;
    data?: {
        name: string;
        email: string;
        phone?: string;
        message: string;
    };
    error?: string;
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as ContactRequest;
        const { firstName, lastName, email, phone, message } = body;

        if (!firstName || !lastName || !email || !message) {
            return NextResponse.json<ContactResponse>(
                { error: "Zorunlu alanlar eksik" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json<ContactResponse>({ error: "Geçersiz E-posta formatı" }, { status: 400 });
        }

        if (phone && !/^\d+$/.test(phone)) {
            return NextResponse.json<ContactResponse>({ error: "Geçersiz Telefon formatı (Sadece rakam)" }, { status: 400 });
        }

        if (message.length > 240) {
            return NextResponse.json<ContactResponse>({ error: "Mesaj en fazla 240 karakter olabilir" }, { status: 400 });
        }

        const fullName = `${firstName} ${lastName}`.trim();

        console.log("Contact message bypassed:", { name: fullName, email, phone, message });

        return NextResponse.json<ContactResponse>({ success: true, data: { name: fullName, email, phone, message } }, { status: 201 });
    } catch (error: unknown) {
        console.error("Contact Form Error:", error);
        let errorMessage = "Mesaj gönderilirken bir hata oluştu";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json<ContactResponse>(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
