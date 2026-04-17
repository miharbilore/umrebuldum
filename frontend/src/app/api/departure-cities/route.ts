import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const departureCities = await prisma.departureCity.findMany({
            orderBy: [
                { priority: 'desc' },
                { name: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                airport: true
            }
        });
        
        return NextResponse.json(departureCities);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch departure cities" }, { status: 500 });
    }
}
