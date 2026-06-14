import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

/**
 * POST /api/chat/read
 * Marks a list of messages as read and broadcasts the event via Pusher.
 * Body: { messageIds: string[], threadId: string }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role === "BANNED") return NextResponse.json({ error: "Account banned" }, { status: 403 });

        const body = await req.json();
        const { messageIds, threadId } = body;

        if (!threadId || !messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }

        // Validate user
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Ensure user is participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: threadId },
            select: { userId: true, guideId: true },
        });

        if (!conversation) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

        const isParticipant = conversation.userId === currentUser.id || conversation.guideId === currentUser.id;
        if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const now = new Date();

        // Update messages that are NOT sent by the current user and where readAt is null
        await prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                conversationId: threadId,
                senderId: { not: currentUser.id },
                readAt: null
            },
            data: {
                readAt: now
            }
        });

        // Trigger pusher event so the sender's UI updates
        await pusherServer.trigger(`chat-${threadId}`, 'messages-read', {
            messageIds,
            readAt: now.toISOString()
        });

        return NextResponse.json({ success: true, readAt: now.toISOString() });

    } catch (error) {
        console.error("Read messages error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
