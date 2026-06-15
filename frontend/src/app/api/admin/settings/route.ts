import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/settings
 * Fetch all system settings
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.systemSetting.findMany();
        const settingsMap = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (e) {
        console.error("GET admin/settings error:", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * POST /api/admin/settings
 * Update a specific system setting
 * Body: { key: string, value: string, description?: string }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { key, value, description } = await req.json();

        if (!key || value === undefined) {
            return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
        }

        const updated = await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value, description }
        });

        return NextResponse.json({ success: true, setting: updated });
    } catch (e) {
        console.error("POST admin/settings error:", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
