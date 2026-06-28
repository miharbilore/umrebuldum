import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-guards";

interface MuteUserRequest {
    userId: string;
    mutedUntil?: string | null;
    reason: string;
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const adminId = session!.user.id!;
        const { userId, mutedUntil, reason } = (await req.json()) as MuteUserRequest;

        if (!userId || typeof userId !== "string") {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }
        if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
            return NextResponse.json({ error: "reason is required (min 3 chars)" }, { status: 400 });
        }

        // Prevent muting yourself or another admin
        if (userId === adminId) {
            return NextResponse.json({ error: "Cannot mute yourself" }, { status: 400 });
        }

        const target = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, email: true },
        });

        if (!target) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (target.role === "ADMIN") {
            return NextResponse.json({ error: "Cannot mute an ADMIN" }, { status: 403 });
        }

        const mutedUntilDate: Date | null = mutedUntil ? new Date(mutedUntil) : null;

        // Apply mute to User (ASIL İŞLEM BURADA YAPILIYOR, BU KISIM SAĞLAM)
        await prisma.user.update({
            where: { id: userId },
            data: {
                isMuted: true,
                mutedUntil: mutedUntilDate,
            },
        });

        // Audit log tabloları silindiği için işlemleri konsola yazdırıyoruz
        console.log("Admin Action Logged:", {
            adminId,
            action: "mute_user_chat",
            targetId: userId,
            reason: reason.trim(),
            metadata: { mutedUntil: mutedUntilDate?.toISOString() ?? "permanent" }
        });

        return NextResponse.json({
            success: true,
            message: `User ${target.email} muted${mutedUntilDate ? ` until ${mutedUntilDate.toISOString()}` : " permanently"}.`,
        });
    } catch (error: unknown) {
        console.error("Admin mute error:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

interface UnmuteUserRequest {
    userId: string;
    reason: string;
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const adminId = session!.user.id!;
        const { userId, reason } = (await req.json()) as UnmuteUserRequest;

        if (!userId || typeof userId !== "string") {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }
        if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
            return NextResponse.json({ error: "reason is required (min 3 chars)" }, { status: 400 });
        }

        const target = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, isMuted: true },
        });

        if (!target) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!target.isMuted) {
            return NextResponse.json({ error: "User is not muted" }, { status: 409 });
        }

        // Unmute User
        await prisma.user.update({
            where: { id: userId },
            data: { isMuted: false, mutedUntil: null },
        });

        // Audit log tabloları silindiği için işlemleri konsola yazdırıyoruz
        console.log("Admin Action Logged:", {
            adminId,
            action: "unmute_user_chat",
            targetId: userId,
            reason: reason.trim()
        });

        return NextResponse.json({
            success: true,
            message: `User ${target.email} unmuted.`,
        });
    } catch (error: unknown) {
        console.error("Admin unmute error:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
