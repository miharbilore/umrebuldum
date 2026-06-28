
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireAuth } from '@/lib/api-guards';

interface RequestFavoriteBody {
    requestId: string;
}

export async function POST(req: Request) {
    const session = await auth();
    // Allow any authenticated user (User, Guide, Org) to favorite requests
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    // requireAuth guarantees session is non-null, user.email is set
    const userEmail = session!.user.email!;

    try {
        const body = (await req.json()) as RequestFavoriteBody;
        const { requestId } = body;

        // Check if favorite exists
        const existing = await prisma.requestFavorite.findUnique({
            where: {
                requestId_userId: {
                    requestId,
                    userId: userEmail
                }
            }
        });

        if (existing) {
            // Remove (Unfavorite)
            await prisma.requestFavorite.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ favorited: false });
        } else {
            // Add (Favorite)
            await prisma.requestFavorite.create({
                data: {
                    requestId,
                    userId: userEmail
                }
            });
            return NextResponse.json({ favorited: true });
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await auth();
    // Allow any authenticated user to read their own favorites
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    // requireAuth guarantees session is non-null, user.email is set
    const userEmail = session!.user.email!;

    const favorites = await prisma.requestFavorite.findMany({
        where: { userId: userEmail },
        select: { requestId: true }
    });

    return NextResponse.json({ favorites: favorites.map(f => f.requestId) });
}
