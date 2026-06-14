import { prisma } from "@/lib/prisma";

export async function runPackageReminders() {
    try {
        const now = new Date();
        const targetStart = new Date(now);
        targetStart.setDate(now.getDate() + 3);
        targetStart.setHours(0, 0, 0, 0);

        const targetEnd = new Date(targetStart);
        targetEnd.setDate(targetStart.getDate() + 1);

        console.log(`[Job] package-reminders: Checking expirations between ${targetStart.toISOString()} and ${targetEnd.toISOString()}`);

        const expiringUsers = await prisma.user.findMany({
            where: {
                packageType: { not: "FREEMIUM" },
                packageExpiry: {
                    gte: targetStart,
                    lt: targetEnd
                }
            },
            select: { id: true, name: true, packageType: true, packageExpiry: true }
        });

        if (expiringUsers.length === 0) {
            return { message: "No packages expiring in 3 days.", count: 0, notificationsSent: 0 };
        }

        let notificationsCreated = 0;

        for (const user of expiringUsers) {
            const existingNotification = await prisma.notification.findFirst({
                where: {
                    userId: user.id,
                    type: "SYSTEM",
                    title: "Paket Süreniz Doluyor",
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            });

            if (!existingNotification) {
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: "SYSTEM",
                        title: "Paket Süreniz Doluyor",
                        message: `Değerli üyemiz, ${user.packageType} paketinizin süresi 3 gün sonra dolacaktır. İlanlarınızın ve teklif haklarınızın kesintiye uğramaması için paketinizi yenilemeyi unutmayın.`,
                        referenceId: "billing"
                    }
                });
                
                // Email can be hooked up here
                notificationsCreated++;
            }
        }

        return { 
            message: "Success", 
            foundUsers: expiringUsers.length,
            notificationsSent: notificationsCreated 
        };

    } catch (err) {
        console.error("[Job] package-reminders failed:", err);
        throw err;
    }
}
