
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSupply } from "@/lib/api-guards";

export async function POST() {
    return NextResponse.json({ error: "Deprecated URL. Please use Stripe Checkout." }, { status: 410 });
}

export async function GET(req: Request) {
    const session = await auth();
    const guard = requireSupply(session);
    if (guard) return guard;

    const user = await prisma.user.findUnique({
        where: { email: session!.user.email! }
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ credits: user.tokenBalance || 0 });
}
