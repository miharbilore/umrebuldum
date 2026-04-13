import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/packages
 * Returns all CreditPackage records from the database.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.role || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const packages = await prisma.creditPackage.findMany({
            orderBy: { sortOrder: "asc" },
        });

        return NextResponse.json(packages);
    } catch (error) {
        console.error("[Admin Packages GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * PUT /api/admin/packages
 * Updates a single CreditPackage record.
 * Body: { id, name?, credits?, priceTRY? }
 */
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.role || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { id, name, credits, priceTRY, monthlyPrice, features } = body;

        if (!id) {
            return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
        }

        const existing = await prisma.creditPackage.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        const updated = await prisma.creditPackage.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(credits !== undefined && { credits: Number(credits) }),
                ...(priceTRY !== undefined && { priceTRY: Number(priceTRY) }),
                ...(monthlyPrice !== undefined && { monthlyPrice: Number(monthlyPrice) }),
                ...(features !== undefined && typeof features === "object" && !Array.isArray(features) && { features }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[Admin Packages PUT]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
