import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Mock Checkout API
 * Bu API gerçek ödeme entegrasyonu (Stripe/PayTR) gelene kadar 
 * başarılı bir ödeme akışını simüle etmek için kullanılır.
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        
        // Mock validation
        if (!data.pkgId || !data.cardName || !data.cardNumber) {
            return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
        }

        // Simüle edilen bekleme süresi (banka onayı vb.)
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`[Mock Checkout] User ${session.user.id} purchased package ${data.pkgId}`);

        return NextResponse.json({
            success: true,
            message: "Ödeme başarıyla tamamlandı. Tokenlarınız yükleniyor.",
            transactionId: `MOCK-${Date.now()}`
        });

    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
