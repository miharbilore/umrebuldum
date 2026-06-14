import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const parentId = url.searchParams.get("parentId") || null;

        const templates = await prisma.chatbotTemplate.findMany({
            where: { isActive: true, parentId },
            orderBy: { order: "asc" },
            select: {
                id: true,
                question: true,
                answer: true,
                _count: { select: { children: true } }
            }
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("Chatbot GET error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: "Soru gereklidir." }, { status: 400 });
        }

        // We can implement simple direct match or simple fuzzy/keyword matching here.
        // For a true "hybrid", we might match against predefined templates first.
        const templates = await prisma.chatbotTemplate.findMany({
            where: { isActive: true },
            select: { id: true, question: true, answer: true, _count: { select: { children: true } } },
        });

        const userQuery = query.toLowerCase().trim();

        let bestMatch = null;
        for (const t of templates) {
            if (userQuery.includes(t.question.toLowerCase().trim()) || t.question.toLowerCase().trim().includes(userQuery)) {
                bestMatch = t;
                break;
            }
        }

        if (bestMatch) {
            return NextResponse.json({ answer: bestMatch.answer || "Lütfen bir alt seçenek seçin.", node: bestMatch });
        }

        // Fallback static answer if no match found
        return NextResponse.json({
            answer: "Üzgünüm, sorunuzu anlayamadım. Size müşteri temsilcimiz yardımcı olabilir.",
            needsWhatsApp: true
        });

    } catch (error) {
        console.error("Chatbot POST error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
