import { prisma } from "@/lib/prisma";

/**
 * Asynchronously matches a new Umrah request with available guides
 * and notifies them without blocking the main API response.
 */
export async function matchAndNotifyGuides(request: any) {
    try {
        console.log(`[Lead Matching] Starting matching for Request: ${request.id}`);

        // 1. Dependency Lock & Active Check:
        // Sadece hesabı onaylı, susturulmamış (isMuted: false) ve en az 1 AKTiF & ONAYLI
        // ilanı olan Rehber/Acenteleri havuza dahil et.
        const eligibleGuides = await prisma.user.findMany({
            where: {
                role: { in: ['GUIDE', 'ORGANIZATION'] },
                isMuted: false,
                isApproved: true,
                guideProfile: {
                    listings: {
                        some: {
                            active: true,
                            approvalStatus: 'APPROVED'
                        }
                    }
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true
            }
        });

        console.log(`[Lead Matching] Found ${eligibleGuides.length} eligible guides/agencies for request ${request.id}.`);

        if (eligibleGuides.length === 0) return;

        // 2. Sistem İçi Bildirim (In-App Notifications)
        const notifications = eligibleGuides.map(guide => ({
            userId: guide.id,
            type: 'NEW_LEAD',
            title: '🎯 Yeni Bir Umre Talebi!',
            message: `${request.departureCity} çıkışlı, ${request.peopleCount} kişilik yeni bir talep geldi. İlk teklifi veren siz olun!`,
            referenceId: request.id,
        }));

        await prisma.notification.createMany({
            data: notifications
        });

        // 3. Dış Bildirim Servisi (SMS & E-Mail Stub)
        // İleride buraya Resend veya Twilio/Netgsm entegre edilecek.
        eligibleGuides.forEach(guide => {
            console.log(`[STUB - NOTIFICATION SENT] SMS/Email -> To: ${guide.email || guide.phone} | Request: ${request.departureCity} / ${request.id}`);
        });

    } catch (error) {
        console.error("[Lead Matching] Error during matchAndNotifyGuides:", error);
    }
}
