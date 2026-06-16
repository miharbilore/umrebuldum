import { prisma } from "@/lib/prisma";

export async function runPackageDowngrades() {
    try {
        const now = new Date();

        console.log(`[Job] package-downgrades: Checking for expired packages at ${now.toISOString()}`);

        const expiredUsers = await prisma.user.findMany({
            where: {
                packageType: { not: "FREEMIUM" },
                packageExpiry: { lte: now }
            },
            select: { id: true, name: true, packageType: true }
        });

        if (expiredUsers.length === 0) {
            return { message: "No expired packages found.", count: 0 };
        }

        const expiredUserIds = expiredUsers.map(u => u.id);

        // Downgrade users and notify them atomically
        const result = await prisma.$transaction(async (tx) => {
            const updateResult = await tx.user.updateMany({
                where: {
                    id: { in: expiredUserIds }
                },
                data: {
                    packageType: "FREEMIUM",
                    packageExpiry: null
                }
            });

            // Create notifications for all downgraded users using createMany for efficiency
            const notificationsData = expiredUsers.map(user => ({
                userId: user.id,
                type: "SYSTEM",
                title: "Paket Süreniz Doldu",
                message: `${user.packageType} paketinizin süresi dolduğu için hesabınız Ücretsiz (Freemium) statüsüne geçirilmiştir. Yeni ilan açabilmek veya alakart token alabilmek için paketinizi yenileyebilirsiniz.`,
                referenceId: "billing"
            }));

            await tx.notification.createMany({
                data: notificationsData
            });

            return updateResult;
        });

        return { 
            message: "Success", 
            downgradedCount: result.count 
        };

    } catch (err) {
        console.error("[Job] package-downgrades failed:", err);
        throw err;
    }
}
