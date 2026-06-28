import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireAuth } from '@/lib/api-guards';

export async function GET(req: Request) {
    const session = await auth();
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session!.user.id! },
            select: { phone: true, contactConsent: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Settings GET error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("Settings GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

interface SettingsRequest {
    contactConsent?: boolean;
    phone?: string;
}

export async function POST(req: Request) {
    const session = await auth();
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    try {
        const body = (await req.json()) as SettingsRequest;
        
        const updateData: { contactConsent?: boolean; phone?: string } = {};
        
        if (typeof body.contactConsent === 'boolean') {
            updateData.contactConsent = Boolean(body.contactConsent);
        }
        
        if (typeof body.phone === 'string') {
            updateData.phone = body.phone.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid data to update" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session!.user.id! },
            data: updateData
        });

        return NextResponse.json({ 
            success: true, 
            contactConsent: updatedUser.contactConsent,
            phone: updatedUser.phone
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Settings update error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("Settings update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
