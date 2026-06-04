import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/packages
 * Public endpoint to fetch all active subscription packages.
 * Sorted by: 
 * 1. Role (GUIDE first, then ORGANIZATION)
 * 2. Starting Price (Low to High)
 */
export async function GET() {
    try {
        const packages = await prisma.creditPackage.findMany({
            orderBy: [
                { roleTarget: 'desc' }, 
                { sortOrder: 'asc' }, // Explicit sorting using admin sortOrder
                { priceTRY: 'asc' }
            ]
        });

        // Manual secondary sorting to ensure GUIDE is strictly first if alphabetical fails to meet expectations
        const sortedPackages = packages.sort((a, b) => {
            if (a.roleTarget === b.roleTarget) {
                if (a.sortOrder !== b.sortOrder) {
                    return a.sortOrder - b.sortOrder;
                }
                return Number(a.priceTRY) - Number(b.priceTRY);
            }
            return a.roleTarget === 'GUIDE' ? -1 : 1;
        });

        return NextResponse.json(sortedPackages);
    } catch (error) {
        console.error("[Packages Public GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
