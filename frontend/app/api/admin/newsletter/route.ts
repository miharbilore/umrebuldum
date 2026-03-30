import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(subscribers);
    } catch (error) {
        console.error("Admin Newsletter GET error:", error);
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
        const { id, isActive } = body;

        if (typeof id !== "string" || typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Geçersiz parametreler." }, { status: 400 });
        }

        const updated = await prisma.newsletterSubscriber.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Admin Newsletter PATCH error:", error);
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

        await prisma.newsletterSubscriber.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin Newsletter DELETE error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
