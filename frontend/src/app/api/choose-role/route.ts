import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-guards"
import { grantToken } from "@/modules/tokens/application/grant-token.usecase"
import { z } from "zod"

// Anti-bypass regex: Block 5+ consecutive digits (phone) or email patterns
const bioAntiBypass = (val: string) => {
    const phoneRegex = /\d{5,}/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return !phoneRegex.test(val) && !emailRegex.test(val);
};

const onboardingSchema = z.object({
    role: z.enum(['USER', 'GUIDE', 'ORGANIZATION']),
    name: z.string().trim().min(3, "Ad Soyad en az 3 karakter olmalıdır").max(50, "Ad Soyad çok uzun").regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇâîûÂÎÛ.\-\s]+$/, "Ad Soyad sadece harf, nokta, tire ve boşluk içermelidir"),
    phone: z.string().trim().min(1, "Telefon numarası zorunludur").regex(/^\+?[1-9]\d{1,14}$/, "Geçerli bir telefon numarası giriniz"),
    city: z.string().trim().min(1, "Şehir seçimi zorunludur"),
    bio: z.string().trim().max(500, "Biyografi 500 karakteri geçemez").refine(bioAntiBypass, {
        message: "Biyografi alanına iletişim bilgisi (telefon veya e-posta) yazılamaz."
    }),
});

/**
 * POST /api/choose-role
 * Hardened endpoint for 5-step onboarding.
 */
export async function POST(req: Request) {
    const session = await auth()
    const guard = requireAuth(session)
    if (guard) return guard

    try {
        const body = await req.json()
        const validation = onboardingSchema.safeParse(body)

        if (!validation.success) {
            console.warn("Onboarding Validation Failed:", JSON.stringify(validation.error.format(), null, 2))
            return NextResponse.json({ 
                error: validation.error.errors[0].message,
                details: validation.error.format() 
            }, { status: 400 })
        }

        const { role, name, phone, city, bio } = validation.data
        const userId = session!.user.id!

        // Find the user to check if this is the first time (already has role?)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, email: true }
        })

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
        }

        // 5-Token Reward Logic
        const rewardIdempotencyKey = `onboarding-reward-${userId}`;

        // Check if phone is already taken by ANOTHER user
        const phoneOwner = await prisma.user.findUnique({
            where: { phone },
            select: { id: true }
        });

        if (phoneOwner && phoneOwner.id !== userId) {
            return NextResponse.json({ error: "Bu telefon numarası başka bir hesap tarafından kullanılıyor." }, { status: 409 });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Update User Profile
            await tx.user.update({
                where: { id: userId },
                data: {
                    role,
                    name,
                    fullName: name,
                    phone,
                    city,
                    bio,
                }
            })

            // 2. Extra profile for GUIDE/ORGANIZATION if not exists
            if (role === 'GUIDE' || role === 'ORGANIZATION') {
                await tx.guideProfile.upsert({
                    where: { userId },
                    create: { userId },
                    update: {} 
                })
            }
        })

        // 3. Grant 5 Tokens Reward only for GUIDE or ORGANIZATION
        let reward = null;
        if (role === 'GUIDE' || role === 'ORGANIZATION') {
            reward = await grantToken({
                userId,
                amount: 5,
                type: "INITIAL_BALANCE",
                reason: "Onboarding Tamamlama Ödülü",
                idempotencyKey: rewardIdempotencyKey
            });
        }

        return NextResponse.json({ 
            success: true, 
            role,
            rewarded: reward ? (reward.ok && !reward.alreadyProcessed) : false
        })

    } catch (error: any) {
        console.error("Onboarding API Error:", error)
        
        // Handle Prisma Unique Constraint specifically
        if (error.code === 'P2002') {
            const target = error.meta?.target || '';
            if (target.includes('phone') || target.includes('users_phone_key')) {
                return NextResponse.json({ error: "Bu telefon numarası zaten kullanımda." }, { status: 409 })
            }
        }

        return NextResponse.json({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 })
    }
}

