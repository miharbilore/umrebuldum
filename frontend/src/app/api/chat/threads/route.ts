
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-guards";

export async function GET(req: Request) {
    try {
        const session = await auth();
        const authErr = requireAuth(session);
        if (authErr) return authErr;

        const role = session!.user.role;
        const email = session!.user.email;

        // Resolve current user ID
        const currentUser = await prisma.user.findUnique({
            where: { email: email! },
            select: { id: true },
        });
        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Filter conversations based on role
        let where: Prisma.ConversationWhereInput = {};
        if (role === 'USER') {
            where = { userId: currentUser.id };
        } else if (role === 'GUIDE' || role === 'ORGANIZATION') {
            where = { guideId: currentUser.id };
        } else {
            return NextResponse.json({ error: "Invalid role" }, { status: 403 });
        }

        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                messages: {
                    where: { blocked: false },
                    orderBy: { createdAt: 'desc' },
                    take: 1 // Only need last message
                },
                request: {
                    select: { departureCity: true, peopleCount: true }
                },
                user: {
                    select: { name: true }
                },
                guide: {
                    select: { user: { select: { name: true } } }
                },
            },
            orderBy: { lastMessageAt: 'desc' },
        });

        // Enrich conversations (no more N+1 queries)
        const enrichedThreads = conversations.map((conv) => {
            const lastMessage = conv.messages[0];

            const displayTitle = conv.request
                ? `${conv.request.departureCity} - ${conv.request.peopleCount} Kişi`
                : "Bilinmeyen Talep";

            let displayCounterparty = "";

            if (role === 'USER') {
                // User sees Guide name
                displayCounterparty = conv.guide?.user?.name || "Rehber";
            } else {
                // Guide sees User initials
                const name = conv.user?.name || "Misafir Kullanıcı";
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                displayCounterparty = initials;
            }

            return {
                id: conv.id,
                requestId: conv.requestId,
                displayTitle,
                displayCounterparty,
                lastMessage: lastMessage?.body || "",
                lastMessageTime: lastMessage?.createdAt.toISOString() || conv.lastMessageAt.toISOString()
            };
        });

        return NextResponse.json(enrichedThreads);

    } catch (error) {
        console.error("Fetch threads error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
