import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * POST /api/guide/report-lead
 * Allows a guide to report a fake or unreachable lead.
 * Sends a notification to the ADMIN.
 *
 * Body: { requestId: string, reason: string }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || (session.user.role !== 'GUIDE' && session.user.role !== 'ORGANIZATION')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { requestId, reason } = await req.json();

        if (!requestId || !reason) {
            return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
        }

        // Verify the request exists
        const request = await prisma.umrahRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });

        // Find admins
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        // Notify admins
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                userId: admin.id,
                type: "SYSTEM_ALERT",
                title: "Talep Şikayeti (Sahte/Ulaşılamıyor)",
                message: `${session.user.name} adlı rehber, ${requestId.slice(-6)} ID'li talebi şikayet etti. Neden: ${reason}`,
                referenceId: requestId
            }));
            await prisma.notification.createMany({ data: notifications });
        }

        return NextResponse.json({ success: true, message: "Şikayetiniz yönetime iletildi. İncelendikten sonra haklı bulunursa token iadesi yapılacaktır." });

    } catch (e) {
        console.error("Report lead error:", e);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}
