
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";
import { z } from "zod";
import { slugify } from "@/lib/slug";

interface ProfileRequest {
    fullName: string;
    phone: string;
    city: string;
    agencyCity?: string;
    bio?: string | null;
    photo?: string | null;
    isIdentityVerified?: boolean;
}

interface ProfileResponse {
    success?: boolean;
    error?: string;
    details?: unknown;
    package?: string;
    tokenBalance?: number;
    fullName?: string;
    phone?: string;
    city?: string;
    agencyCity?: string | null;
    bio?: string | null;
    photo?: string | null;
    isIdentityVerified?: boolean;
    hasCompletedQuiz?: boolean;
    quizAttempts?: number;
    lastQuizAttempt?: Date | null;
    userId?: string;
    quotaTarget?: number;
    currentCount?: number;
}

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
        if (!user) return NextResponse.json<ProfileResponse>({ error: "User not found" }, { status: 404 });

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

        const {
            fullName,
            phone,
            city,
            agencyCity,
            bio,
            photo,
            isIdentityVerified,
            packageType,
            tokenBalance,
            hasCompletedQuiz,
            quizAttempts,
            lastQuizAttempt
        } = user;

        return NextResponse.json<ProfileResponse>({
            ...profile,
            fullName: fullName ?? undefined,
            phone: phone ?? undefined,
            city: city ?? undefined,
            agencyCity: agencyCity ?? undefined,
            bio: bio ?? undefined,
            photo: photo ?? undefined,
            isIdentityVerified: isIdentityVerified ?? undefined,
            package: packageType ?? undefined,
            tokenBalance,
            hasCompletedQuiz,
            quizAttempts,
            lastQuizAttempt
        });
    } catch (error: unknown) {
        return NextResponse.json<ProfileResponse>({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const body = (await req.json()) as ProfileRequest;

        const validation = profileSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json<ProfileResponse>(
                { error: "Geçersiz veriler", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { fullName, phone, city, agencyCity, bio, photo } = validation.data;

        // email guaranteed non-null after requireSupply guard
        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json<ProfileResponse>({ error: "User not found" }, { status: 404 });

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
                photo: photo,
                // Only set slug if it doesn't exist yet
                slug: user.slug ? undefined : slugify(fullName)
            }
        });

        return NextResponse.json<ProfileResponse>({ success: true, package: user.packageType, tokenBalance: user.tokenBalance });

    } catch (error: unknown) {
        return NextResponse.json<ProfileResponse>({ error: "Internal Error" }, { status: 500 });
    }
}
