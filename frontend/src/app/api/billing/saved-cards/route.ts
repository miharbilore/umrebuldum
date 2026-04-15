import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/billing/saved-cards
 *
 * Returns the current user's saved (tokenized) cards.
 * No actual card data is stored — only tokens and last4 digits.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cards = await prisma.savedCard.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: {
            id: true,
            provider: true,
            last4: true,
            brand: true,
            expiryMonth: true,
            expiryYear: true,
            isDefault: true,
            createdAt: true,
        },
    });

    return NextResponse.json(cards);
}

/**
 * DELETE /api/billing/saved-cards
 *
 * Remove a saved card by ID.
 * Body: { cardId: string }
 */
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { cardId } = await req.json();
    if (!cardId) {
        return NextResponse.json({ error: "Missing cardId" }, { status: 400 });
    }

    // Ensure the card belongs to the user
    const card = await prisma.savedCard.findFirst({
        where: { id: cardId, userId: user.id },
    });

    if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await prisma.savedCard.delete({ where: { id: cardId } });

    return NextResponse.json({ success: true });
}

/**
 * PATCH /api/billing/saved-cards
 *
 * Set a card as default.
 * Body: { cardId: string }
 */
export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { cardId } = await req.json();
    if (!cardId) {
        return NextResponse.json({ error: "Missing cardId" }, { status: 400 });
    }

    // Ensure the card belongs to the user
    const card = await prisma.savedCard.findFirst({
        where: { id: cardId, userId: user.id },
    });

    if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Remove default from all other cards, set this one
    await prisma.$transaction([
        prisma.savedCard.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
        }),
        prisma.savedCard.update({
            where: { id: cardId },
            data: { isDefault: true },
        }),
    ]);

    return NextResponse.json({ success: true });
}
