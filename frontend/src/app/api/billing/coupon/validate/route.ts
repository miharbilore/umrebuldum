import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/billing/coupon/validate
 * Body: { code: string }
 * Returns: { valid, discountPercent, message }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { code } = body;

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { valid: false, message: "Kupon kodu gereklidir." },
                { status: 400 }
            );
        }

        const coupon = await (prisma as any).coupon.findUnique({
            where: { code: code.toUpperCase().trim() },
        });

        if (!coupon) {
            return NextResponse.json({
                valid: false,
                message: "Geçersiz kupon kodu.",
            });
        }

        if (!coupon.isActive) {
            return NextResponse.json({
                valid: false,
                message: "Bu kupon artık aktif değil.",
            });
        }

        if (new Date() > new Date(coupon.expiresAt)) {
            return NextResponse.json({
                valid: false,
                message: "Bu kuponun süresi dolmuş.",
            });
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({
                valid: false,
                message: "Bu kupon kullanım limitine ulaşmış.",
            });
        }

        return NextResponse.json({
            valid: true,
            discountPercent: coupon.discountPercent,
            message: `%${coupon.discountPercent} indirim uygulanacak!`,
        });
    } catch (error) {
        console.error("[Coupon Validate]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
