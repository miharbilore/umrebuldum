import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
    const categories = await prisma.listingCategory.findMany({
        select: { slug: true, name: true },
        orderBy: { name: "asc" }
    });

    return NextResponse.json({ data: categories });
};
