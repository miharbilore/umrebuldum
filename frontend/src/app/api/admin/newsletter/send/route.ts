import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { targetAudience, subject, htmlContent } = body;

        if (!targetAudience || !subject || !htmlContent) {
            return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
        }

        let recipients: string[] = [];

        switch (targetAudience) {
            case "SUBSCRIBERS":
                const subs = await prisma.newsletterSubscriber.findMany({
                    where: { isActive: true },
                    select: { email: true }
                });
                recipients = subs.map(s => s.email);
                break;

            case "GUIDES":
                const guides = await prisma.user.findMany({
                    where: { 
                        role: { in: ["GUIDE", "ORGANIZATION"] },
                        isApproved: true
                    },
                    select: { email: true }
                });
                recipients = guides.map(g => g.email).filter((e): e is string => e !== null);
                break;

            case "ALL_USERS":
                const users = await prisma.user.findMany({
                    select: { email: true }
                });
                recipients = users.map(u => u.email).filter((e): e is string => e !== null);
                break;

            default:
                return NextResponse.json({ error: "Geçersiz hedef kitle" }, { status: 400 });
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: "Seçilen kitleye ait e-posta bulunamadı" }, { status: 404 });
        }

        // Resend batch send
        // Resend supports up to 100 emails per batch. For huge lists, we would need chunking.
        const CHUNK_SIZE = 100;
        const chunks = [];
        
        for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
            chunks.push(recipients.slice(i, i + CHUNK_SIZE));
        }

        let successCount = 0;

        for (const chunk of chunks) {
            const batchPayload = chunk.map((email) => ({
                from: "Umre Buldum <info@umrebuldum.com>", // Gerekirse buraya verify edilmiş gönderici adresini girin
                to: [email],
                subject: subject,
                html: htmlContent,
            }));

            const { data, error } = await resend.batch.send(batchPayload);

            if (error) {
                console.error("Resend batch send error:", error);
                throw new Error(error.message);
            }
            successCount += chunk.length;
        }

        return NextResponse.json({ 
            success: true, 
            message: `${successCount} adet e-posta başarıyla gönderildi/kuyruğa eklendi.`,
            count: successCount
        });

    } catch (error: any) {
        console.error("[NEWSLETTER_SEND_ERROR]", error);
        return NextResponse.json({ error: error.message || "E-posta gönderimi başarısız oldu" }, { status: 500 });
    }
}
