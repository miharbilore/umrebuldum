
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";
import { z } from "zod";

const profileSchema = z.object({
    fullName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Geçerli bir uluslararası telefon numarası giriniz (Örn: +90555...)"),
    city: z.string().min(2, "Şehir bilgisi gereklidir"),
    agencyCity: z.string().optional(),
    bio: z.string().nullable().optional(),
    photo: z.string().nullable().optional(),
    isIdentityVerified: z.boolean().optional(),
});

export async function GET(req: Request) {
    try {
        const session = await auth();
        // VULN-7 fix: GuideProfile data is only for GUIDE/ORG — USERs have no profile to read
        const authErr = requireSupply(session);
        if (authErr) return authErr;

        // email guaranteed non-null after requireSupply guard
        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Get or create profile
        const profile = await prisma.guideProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                quotaTarget: 30,
                currentCount: 0
            }
        });

        return NextResponse.json({
            ...profile,
            fullName: user.fullName,
            phone: user.phone,
            city: user.city,
            agencyCity: user.agencyCity,
            bio: user.bio,
            photo: user.photo,
            isIdentityVerified: user.isIdentityVerified,
            package: user.packageType,
            tokenBalance: user.tokenBalance
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const body = await req.json();

        const validation = profileSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Geçersiz veriler", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { fullName, phone, city, agencyCity, bio, photo } = validation.data;

        // email guaranteed non-null after requireSupply guard
        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        await prisma.guideProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                quotaTarget: 30,
                currentCount: 0
            }
        });

        // SSOT: Update all identity & profile fields in the User model
        await prisma.user.update({
            where: { id: user.id },
            data: {
                fullName: fullName,
                phone: phone,
                city: city,
                agencyCity: agencyCity ?? null,
                bio: bio,
                photo: photo
            }
        });

        return NextResponse.json({ success: true, package: user.packageType, tokenBalance: user.tokenBalance });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
