import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cities = await prisma.departureCity.findMany();
        const prioritize = ["İstanbul", "Ankara", "İzmir"];
        const priorityLookup = new Map(prioritize.map((name, index) => [name, index]));

        const sanitizeName = (name: string | null | undefined) =>
            (name || "").replace(/\*/g, "").trim();

        const cleanedCities = cities.map((city) => ({
            ...city,
            name: sanitizeName(city.name)
        }));

        cleanedCities.sort((a, b) => {
            const aPriority = priorityLookup.get(a.name);
            const bPriority = priorityLookup.get(b.name);

            if (aPriority !== undefined || bPriority !== undefined) {
                if (aPriority === undefined) return 1;
                if (bPriority === undefined) return -1;
                return aPriority - bPriority;
            }

            return a.name.localeCompare(b.name, "tr");
        });

        return NextResponse.json(cleanedCities);
    } catch (error) {
        console.error("Cities API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
