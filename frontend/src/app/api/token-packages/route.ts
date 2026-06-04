import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const packages = await prisma.tokenPackageConfig.findMany({
            where: { isActive: true },
            orderBy: { tokens: "asc" }
        });
        return NextResponse.json(packages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
