import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        
        const packages = await prisma.tokenPackageConfig.findMany({
            orderBy: { tokens: "asc" }
        });
        return NextResponse.json(packages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { id, tokens, priceTRY, unitPrice, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: "Paket ID zorunludur." }, { status: 400 });
        }

        const updated = await prisma.tokenPackageConfig.update({
            where: { id },
            data: { tokens, priceTRY, unitPrice, isActive }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
