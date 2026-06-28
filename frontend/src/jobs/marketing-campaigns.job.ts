import { prisma } from "@/lib/prisma";


export async function runMarketingAutomations() {
    console.log("[Marketing Automations] Starting automated campaigns check...");
    let sentCount = 0;

    try {
        // 1. Yarım Bırakılan Profil (Onboarding Hatırlatıcı)
        // 24 saatten eski, 48 saatten yeni kaydolmuş ve profili tamamlanmamış rehberlere mail at.
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const incompleteGuides = await prisma.user.findMany({
            where: {
                role: { in: ["GUIDE", "ORGANIZATION"] },
                onboardingCompleted: false,
                createdAt: {
                    gte: twoDaysAgo,
                    lt: oneDayAgo
                },
                marketingConsent: true,
                email: { not: null }
            },
            select: { email: true, name: true, id: true }
        });

        for (const guide of incompleteGuides) {
            // Şablon kurgulanacak (Şimdilik mock)
            // await sendEmail({ to: guide.email!, subject: "Profilinizi Tamamlayın!", html: "..." });
            sentCount++;
            console.log(`[Marketing Automations] Incomplete profile email prepared for ${guide.email}`);
        }

        // 2. İnaktif Kullanıcılar (Re-engagement)
        // 30 gündür güncellenmeyen kullanıcılara mail at.
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const inactiveUsers = await prisma.user.findMany({
            where: {
                marketingConsent: true,
                updatedAt: { lt: thirtyDaysAgo },
                email: { not: null }
            },
            take: 50
        });

        for (const user of inactiveUsers) {
            // await sendEmail({ to: user.email!, subject: "Sizi Özledik!", html: "..." });
            sentCount++;
            console.log(`[Marketing Automations] Re-engagement email prepared for ${user.email}`);
        }

        return { success: true, emailsSent: sentCount };
    } catch (error) {
        console.error("[Marketing Automations] Error running campaigns:", error);
        return { success: false, error };
    }
}
