import { inngest } from "../client";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/email-service";
import { smsService } from "@/lib/sms/sms-service";

export const notificationRouter = inngest.createFunction(
    { id: "notification-router", triggers: [{ event: "event/DEMAND_UNLOCKED" }] },
    async ({ event, step }: { event: any, step: any }) => {
        const { demandId, guideId } = event.data;

        // 1. Fetch related data to know WHO to notify
        const demand = await step.run("fetch-demand-details", async () => {
            return await prisma.umrahRequest.findUnique({
                where: { id: demandId }
            });
        });

        if (!demand) {
            return { error: "Demand not found" };
        }

        const guide = await step.run("fetch-guide-details", async () => {
             return await prisma.user.findUnique({
                 where: { id: guideId },
                 include: { guideProfile: true }
             });
        });

        if (!guide) {
             return { error: "Guide not found" };
        }

        // We assume demand owner's email is `demand.userEmail`
        const customerEmail = demand.userEmail;
        const customer = await step.run("fetch-customer-user", async () => {
             return await prisma.user.findUnique({
                 where: { email: customerEmail }
             });
        });

        // 2. Save In-App Notification (always)
        await step.run("save-in-app-notification", async () => {
            if (customer) {
                await prisma.notification.create({
                    data: {
                        userId: customer.id,
                        type: "IN_APP",
                        title: "Yeni Bir Rehber Talebinizi Yanıtladı!",
                        message: `${guide.guideProfile?.fullName || guide.name} talebinizle ilgileniyor.`,
                        referenceId: demandId,
                    }
                });
            }
        });

        // 3. Determine Preferences (Routing Logic)
        const wantsEmail = demand.contactViaEmail ?? true;
        const wantsSMS = demand.contactViaPhone ?? true; // If they wanted phone contact, we'll ping SMS

        // 4. Dispatch Email if preferred
        if (wantsEmail) {
            await step.run("send-email-notification", async () => {
                 await emailService.sendAsync(customerEmail, {
                     subject: "Talebinize Yeni İlgi!",
                     html: `<p>Merhaba, talebinize <strong>${guide.guideProfile?.fullName || guide.name}</strong> ilgi gösterdi. Hemen sisteme girip iletişimi başlatabilirsiniz.</p>`
                 });
                 // Also log it into the DB if you want pure traceability
                 if (customer) {
                     await prisma.notification.create({
                         data: {
                             userId: customer.id,
                             type: "EMAIL",
                             title: "Email Sent: Talebinize Yeni İlgi",
                             message: "Sent standard notification email.",
                             referenceId: demandId,
                             isRead: true, // system log
                         }
                     });
                 }
            });
        }

        // 5. Dispatch SMS if preferred
        if (wantsSMS) {
            await step.run("send-sms-notification", async () => {
                 const customerPhone = customer?.phone || "0000000000"; // Mock or retrieve from DB
                 await smsService.sendSMS(customerPhone, `UmreBuldum: Talebinize ${guide.guideProfile?.fullName || guide.name} adli rehber ilgi gosterdi. Uygulamaya giris yapin.`);
                 
                 // Log into DB
                 if (customer) {
                     await prisma.notification.create({
                         data: {
                             userId: customer.id,
                             type: "SMS",
                             title: "SMS Sent: Talebinize Yeni İlgi",
                             message: "Sent standard notification SMS.",
                             referenceId: demandId,
                             isRead: true, // system log
                         }
                     });
                 }
            });
        }

        return { success: true, eventId: event.id };
    }
);
