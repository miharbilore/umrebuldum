import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface CheckoutRequest {
    pkgId: string;
    cardName: string;
    cardNumber: string;
}

interface CheckoutResponse {
    success?: boolean;
    message?: string;
    transactionId?: string;
    error?: string;
}

/**
 * Mock Checkout API
 * Bu API gerçek ödeme entegrasyonu (Stripe/PayTR) gelene kadar 
 * başarılı bir ödeme akışını simüle etmek için kullanılır.
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json<CheckoutResponse>({ error: "Unauthorized" }, { status: 401 });
        }

        const data = (await req.json()) as CheckoutRequest;
        
        // Mock validation
        if (!data.pkgId || !data.cardName || !data.cardNumber) {
            return NextResponse.json<CheckoutResponse>({ error: "Eksik bilgi gönderildi." }, { status: 400 });
        }

        // Simüle edilen bekleme süresi (banka onayı vb.)
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`[Mock Checkout] User ${session.user.id} purchased package ${data.pkgId}`);

        return NextResponse.json<CheckoutResponse>({
            success: true,
            message: "Ödeme başarıyla tamamlandı. Tokenlarınız yükleniyor.",
            transactionId: `MOCK-${Date.now()}`
        });

    } catch (error: unknown) {
        console.error("Checkout error:", error);
        let errorMessage = "Internal Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json<CheckoutResponse>({ error: errorMessage }, { status: 500 });
    }
}
