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

        // 3. Dış Bildirim Servisi (E-Mail)
        // Resend üzerinden gerçek e-posta gönderimi
        const { emailService } = await import("./email/email-service");
        const { newLeadTemplate } = await import("./email/email-templates");

        eligibleGuides.forEach(guide => {
            if (guide.email) {
                emailService.sendAsync(
                    guide.email,
                    newLeadTemplate({
                        guideName: guide.name || "Rehber",
                        departureCity: request.departureCity || "Belirtilmemiş",
                        peopleCount: request.peopleCount || 1,
                        requestUrl: `${process.env.NEXTAUTH_URL || 'https://umrebuldum.com'}/dashboard/requests/${request.id}`
                    })
                );
            }
        });

    } catch (error) {
        console.error("[Lead Matching] Error during matchAndNotifyGuides:", error);
    }
}
