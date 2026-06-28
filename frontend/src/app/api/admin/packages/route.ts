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
    } catch (error: unknown) {
        console.error("[Admin Packages GET]", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

interface UpdatePackageRequest {
    id: string;
    name?: string;
    credits?: number | string;
    priceTRY?: number | string;
    monthlyPrice?: number | string;
    features?: any;
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

        const { id, name, credits, priceTRY, monthlyPrice, features } = (await req.json()) as UpdatePackageRequest;

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
    } catch (error: unknown) {
        console.error("[Admin Packages PUT]", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
interface CreatePackageRequest {
    slug: string;
    name: string;
    credits: number | string;
    priceTRY: number | string;
    monthlyPrice?: number | string;
    billingPeriod?: number | string;
    roleTarget: string;
    features?: any;
}

/**
 * POST /api/admin/packages
 * Creates a new CreditPackage record.
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.role || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { slug, name, credits, priceTRY, monthlyPrice, billingPeriod, roleTarget, features } = (await req.json()) as CreatePackageRequest;

        // Basic validation
        if (!slug || !name || credits === undefined || priceTRY === undefined || !roleTarget) {
            return NextResponse.json({ error: "Missing required fields (slug, name, credits, priceTRY, roleTarget)" }, { status: 400 });
        }

        const newPackage = await prisma.creditPackage.create({
            data: {
                slug,
                name,
                credits: Number(credits),
                priceTRY: Number(priceTRY),
                monthlyPrice: Number(monthlyPrice || 0),
                billingPeriod: Number(billingPeriod || 1),
                roleTarget,
                features: features || {},
                sortOrder: 0, // Frontend will sort by price anyway
            },
        });

        return NextResponse.json(newPackage);
    } catch (error: unknown) {
        console.error("[Admin Packages POST]", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
