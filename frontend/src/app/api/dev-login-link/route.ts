import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const devSecret = process.env.DEV_SECRET;
    if (!devSecret) {
        return NextResponse.json({ error: "DEV_SECRET not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    if (secret !== devSecret) {
        return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

    try {
        const filePath = path.join(process.cwd(), "data", "dev-login.json");
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "No login link found" }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        const email = searchParams.get("email");

        if (email && data.email !== email) {
            return NextResponse.json({ error: "No link found for this email" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to read login link" }, { status: 500 });
    }
}
