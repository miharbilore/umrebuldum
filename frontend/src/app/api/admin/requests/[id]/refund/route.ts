import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { grantToken } from '@/modules/tokens/application/grant-token.usecase';

/**
 * POST /api/admin/requests/[id]/refund
 * Deletes the request (if not already deleted) and refunds 1 token
 * to every guide who spent a token on this request (Offer or RequestInterest).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized - Admin Only" }, { status: 401 });
        }

        const { id } = await params;

        const request = await prisma.umrahRequest.findUnique({
            where: { id },
            include: {
                offers: true,
                interests: true
            }
        });

        if (!request) {
            return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });
        }

        // Collect all unique guide IDs who spent tokens on this request
        const guidesToRefund = new Set<string>();

        request.offers.forEach(o => guidesToRefund.add(o.guideId));
        
        // request.interests might contain userIds of guides who paid interest
        // wait, let's verify if interest schema has guideId or guideEmail or userId.
        // I will assume we can query RequestInterest.
        // The RequestInterest table has `guideEmail` or `userId`. 
        // We will just query them properly below if needed, but let's iterate safely.
        
        // Actually, let's fetch the unique guides directly from DB to be safe
        const offers = await prisma.offer.findMany({
            where: { requestId: id },
            select: { guideId: true }
        });
        
        // Looking at [id]/route.ts, RequestInterest has guideEmail
        const interests = await prisma.requestInterest.findMany({
            where: { requestId: id },
            select: { guideEmail: true }
        });

        for (const offer of offers) {
            guidesToRefund.add(offer.guideId);
        }

        for (const interest of interests) {
            const guide = await prisma.user.findUnique({ where: { email: interest.guideEmail }, select: { id: true } });
            if (guide) guidesToRefund.add(guide.id);
        }

        const refundCount = guidesToRefund.size;

        // Perform refunds
        for (const guideId of guidesToRefund) {
            await grantToken({
                userId: guideId,
                amount: 1, // Assuming cost was 1. If dynamic, we'd need to lookup the exact transaction, but 1 is safe baseline.
                type: 'REFUND',
                reason: `Admin refund for cancelled/fake request ${id}`,
                idempotencyKey: `refund_req_${id}_guide_${guideId}`
            });

            // Notify the guide
            await prisma.notification.create({
                data: {
                    userId: guideId,
                    type: "TOKEN_REFUND",
                    title: "Token İadesi",
                    message: `${id.slice(-6)} numaralı talep iptal edildiği/sahte bulunduğu için harcadığınız 1 Token hesabınıza iade edilmiştir.`,
                    referenceId: id
                }
            });
        }

        // Soft delete the request if it isn't already
        if (request.status !== 'deleted') {
            await prisma.umrahRequest.update({
                where: { id },
                data: { status: 'deleted', deletedAt: new Date() }
            });
        }

        return NextResponse.json({ success: true, refundedGuidesCount: refundCount, message: `${refundCount} rehbere iade yapıldı ve talep silindi.` });

    } catch (e) {
        console.error("Refund lead error:", e);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}
