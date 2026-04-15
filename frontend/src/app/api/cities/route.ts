import { NextResponse } from "next/server";
import { cities } from "@/lib/data/cities";

export async function GET() {
    return NextResponse.json(cities);
}
