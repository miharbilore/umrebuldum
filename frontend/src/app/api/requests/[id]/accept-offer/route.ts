import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * POST /api/requests/[id]/accept-offer
 * Accepts a specific offer for a request.
 * - Sets the selected offer status to 'accepted'
 * - Sets all other offers for this request to 'rejected'
 * - Sets the UmrahRequest status to 'completed'
 *
 * Body: { offerId: string }
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: requestId } = await params;
        const { offerId } = await req.json();

        if (!offerId) {
            return NextResponse.json({ error: "Missing offerId" }, { status: 400 });
        }

        // 1. Verify ownership of the request
        const request = await prisma.umrahRequest.findUnique({
            where: { id: requestId },
            select: { userEmail: true, status: true, id: true }
        });

        if (!request) return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });
        if (request.userEmail !== session.user.email) {
            return NextResponse.json({ error: "Bu işlemi yapmak için yetkiniz yok" }, { status: 403 });
        }
        if (request.status === 'completed' || request.status === 'closed' || request.status === 'deleted') {
            return NextResponse.json({ error: "Bu talep zaten kapatılmış veya tamamlanmış" }, { status: 400 });
        }

        // 2. Verify the offer exists and belongs to this request
        const selectedOffer = await prisma.offer.findUnique({
            where: { id: offerId },
            include: { guide: { select: { id: true, email: true, name: true } } }
        });

        if (!selectedOffer || selectedOffer.requestId !== requestId) {
            return NextResponse.json({ error: "Geçersiz teklif" }, { status: 400 });
        }

        // 3. Perform the acceptance logic in a transaction
        await prisma.$transaction(async (tx) => {
            // Mark the selected offer as accepted
            await tx.offer.update({
                where: { id: offerId },
                data: { status: 'accepted' }
            });

            // Mark all other offers for this request as rejected
            await tx.offer.updateMany({
                where: {
                    requestId: requestId,
                    id: { not: offerId }
                },
                data: { status: 'rejected' }
            });

            // Mark the request as completed
            await tx.umrahRequest.update({
                where: { id: requestId },
                data: { status: 'completed' }
            });

            // 4. Notifications
            // Notify the winning guide
            await tx.notification.create({
                data: {
                    userId: selectedOffer.guideId,
                    type: "LEAD_WON",
                    title: "🎉 Teklifiniz Kabul Edildi!",
                    message: `Tebrikler! ${requestId.slice(-6)} numaralı talebe verdiğiniz teklif müşteri tarafından kabul edildi. Detaylar için iletişime geçebilirsiniz.`,
                    referenceId: requestId
                }
            });

            // Notify the losing guides
            const rejectedOffers = await tx.offer.findMany({
                where: {
                    requestId: requestId,
                    id: { not: offerId }
                },
                select: { guideId: true }
            });

            if (rejectedOffers.length > 0) {
                const notifications = rejectedOffers.map(o => ({
                    userId: o.guideId,
                    type: "LEAD_LOST",
                    title: "Teklifiniz Reddedildi",
                    message: `${requestId.slice(-6)} numaralı talebin sahibi, başka bir acente/rehber ile anlaşma sağladı. İlginiz için teşekkürler.`,
                    referenceId: requestId
                }));
                await tx.notification.createMany({ data: notifications });
            }
        });

        return NextResponse.json({ success: true, message: "Teklif başarıyla kabul edildi." });

    } catch (e) {
        console.error("Accept offer error:", e);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}
