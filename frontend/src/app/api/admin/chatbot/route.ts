import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const templates = await prisma.chatbotTemplate.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("Admin Chatbot GET error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { question, answer, order } = body;

        if (!question || !answer) {
            return NextResponse.json({ error: "Soru ve cevap alanları zorunludur." }, { status: 400 });
        }

        const newTemplate = await prisma.chatbotTemplate.create({
            data: {
                question,
                answer,
                order: order ? parseInt(order) : 0,
            },
        });

        return NextResponse.json(newTemplate, { status: 201 });
    } catch (error) {
        console.error("Admin Chatbot POST error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { id, question, answer, isActive, order } = body;

        if (!id) {
            return NextResponse.json({ error: "ID parametresi eksik." }, { status: 400 });
        }

        const updated = await prisma.chatbotTemplate.update({
            where: { id },
            data: {
                ...(question && { question }),
                ...(answer && { answer }),
                ...(isActive !== undefined && { isActive }),
                ...(order !== undefined && { order: parseInt(order) }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Admin Chatbot PATCH error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID parametresi eksik." }, { status: 400 });
        }

        await prisma.chatbotTemplate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin Chatbot DELETE error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
