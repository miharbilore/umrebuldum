import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PackageSystem } from "@/lib/package-system";
import { requireSupply } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { Prisma, ApprovalStatus, PackageTier } from "@prisma/client";
import { getRoleConfig } from "@/lib/role-config";
import { safeErrorMessage } from "@/lib/safe-error";
import { calculateListingScore } from "@/lib/listing-ranking";
import { spendToken } from "@/modules/tokens";
import { sanitizeCityName } from "@/lib/city-utils";

import { withErrorHandler } from "@/lib/errors/api-handler";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";

export const GET = withErrorHandler(async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const guideId = searchParams.get('guideId');
        const departureCityParam = searchParams.get('departureCity') || searchParams.get('departureCityId');
        const rawCity = searchParams.get('city');
        const city = sanitizeCityName(rawCity) || null;
        const searchDate = searchParams.get('date');
        const minDate = searchParams.get('minDate');
        const maxDate = searchParams.get('maxDate');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const isIdentityVerifiedFilter = searchParams.get('isIdentityVerified');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const skip = (page - 1) * limit;

        const now = new Date();
        const toTurkishTitleCase = (value: string) =>
            value
                .toLocaleLowerCase("tr-TR")
                .split(" ")
                .map((word) => (word ? `${word[0].toLocaleUpperCase("tr-TR")}${word.slice(1)}` : ""))
                .join(" ");

        // Build where clause
        let where: Prisma.GuideListingWhereInput = {
            active: true,
            approvalStatus: ApprovalStatus.APPROVED,
            deletedAt: null,
            endDate: { gte: now }
        };
        const appendAndFilter = (filter: Prisma.GuideListingWhereInput) => {
            const existingAnd = Array.isArray(where.AND) ? where.AND : (where.AND ? [where.AND] : []);
            where.AND = [...existingAnd, filter];
        };

        if (guideId) where.guideId = guideId;
        const sanitizedDepartureCity = sanitizeCityName(departureCityParam) || null;
        if (sanitizedDepartureCity && sanitizedDepartureCity.toLowerCase() !== 'all') {
            appendAndFilter({
                OR: [
                    { departureCityId: sanitizedDepartureCity },
                    { departureCity: { name: { equals: sanitizedDepartureCity } } }
                ]
            });
        }
        if (city) {
            const trimmedCity = city.trim();
            const normalizedCity = toTurkishTitleCase(trimmedCity);
            const cityCandidates = Array.from(new Set([trimmedCity, normalizedCity]));
            appendAndFilter({ OR: cityCandidates.map((candidate) => ({ city: { contains: candidate } })) });
        }

        // Identity verification is now strictly on the User model
        if (isIdentityVerifiedFilter === 'true') {
            where.guide = { user: { isIdentityVerified: true } };
        }

        // Price mapping (Using pricingQuad as the base comparative price since legacy 'price' is deleted)
        if (minPrice || maxPrice) {
            where.pricingQuad = {};
            if (minPrice) where.pricingQuad.gte = parseFloat(minPrice);
            if (maxPrice) where.pricingQuad.lte = parseFloat(maxPrice);
        }

        if (minDate || maxDate) {
            if (minDate) where.endDate = { gte: new Date(minDate) };
            if (maxDate) where.startDate = { lte: new Date(maxDate) };
        } else if (searchDate) {
            const parsedDate = new Date(searchDate);
            where.startDate = { lte: parsedDate };
            where.endDate = { gte: parsedDate };
        }

        const totalCount = await prisma.guideListing.count({ where });

        let listings = await prisma.guideListing.findMany({
            where,
            take: limit,
            skip: skip,
            select: {
                id: true,
                guideId: true,
                title: true,
                description: true,
                city: true,
                departureCityId: true,
                meetingCity: true,
                extraServices: true,
                hotelName: true,
                airlineId: true,
                pricingDouble: true,
                pricingTriple: true,
                pricingQuad: true,
                pricingCurrency: true,
                quota: true,
                filled: true,
                active: true,
                isFeatured: true,
                startDate: true,
                departureDateEnd: true,
                endDate: true,
                totalDays: true,
                approvalStatus: true,
                urgencyTag: true,
                legalConsent: true,
                consentTimestamp: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                departureCity: { select: { name: true } },
                airline: { select: { name: true } },
                tourDays: {
                    orderBy: { day: 'asc' as const },
                    select: { day: true, city: true, title: true, description: true },
                },
                guide: {
                    select: {
                        averageRating: true,
                        reviewCount: true,
                        // Profile data is now safely stored in the User model (SSOT)
                        user: { 
                            select: { 
                                fullName: true,
                                city: true,
                                bio: true,
                                photo: true,
                                trustScore: true,
                                completedTrips: true,
                                packageType: true,
                                isIdentityVerified: true 
                            } 
                        }
                    },
                },
            },
            orderBy: [
                { isFeatured: 'desc' },
                { updatedAt: 'desc' }
            ]
        });

        const enrichedListings = await Promise.all(listings.map(async l => {
            const guideUser = l.guide?.user;
            const pkgType = guideUser?.packageType ? String(guideUser.packageType) : "FREEMIUM";
            const showPhone = guideUser ? await PackageSystem.isPhoneVisible(pkgType) : false;

            return {
                id: l.id,
                guideId: l.guideId,
                title: l.title,
                description: l.description,
                city: sanitizeCityName(l.city) || "",
                departureCity: sanitizeCityName(l.departureCity?.name) || "Bilinmiyor",
                departureCityId: l.departureCityId,
                meetingCity: sanitizeCityName(l.meetingCity),
                extraServices: l.extraServices,
                hotelName: l.hotelName,
                airline: l.airline?.name || "Bilinmiyor",
                airlineId: l.airlineId,
                pricing: {
                    double: Number(l.pricingDouble),
                    triple: Number(l.pricingTriple),
                    quad: Number(l.pricingQuad),
                    currency: l.pricingCurrency
                },
                price: Number(l.pricingQuad), // Base fallback price for frontend
                quota: l.quota,
                filled: l.filled,
                active: l.active,
                isFeatured: l.isFeatured,
                startDate: l.startDate.toISOString().split('T')[0],
                endDate: l.endDate.toISOString().split('T')[0],
                totalDays: l.totalDays,
                tourPlan: l.tourDays.map(d => ({
                    day: d.day,
                    city: sanitizeCityName(d.city) || "",
                    title: d.title,
                    description: d.description
                })),
                approvalStatus: l.approvalStatus,
                urgencyTag: l.urgencyTag,
                legalConsent: l.legalConsent,
                consentTimestamp: l.consentTimestamp?.toISOString(),
                image: l.image,
                createdAt: l.createdAt.toISOString(),
                guide: guideUser ? {
                    fullName: guideUser.fullName,
                    city: guideUser.city,
                    bio: guideUser.bio,
                    isIdentityVerified: guideUser.isIdentityVerified || false,
                    photo: guideUser.photo,
                    trustScore: guideUser.trustScore || 50,
                    completedTrips: guideUser.completedTrips || 0,
                    package: pkgType,
                    averageRating: Number(l.guide?.averageRating || 0),
                    reviewCount: l.guide?.reviewCount || 0
                } : null
            };
        }));

        const scoredListings = enrichedListings.map(l => ({
            ...l,
            _score: calculateListingScore(
                {
                    type: "GUIDE_PROFILE",
                    isFeatured: l.isFeatured || false,
                    featuredUntil: null, 
                    boostScore: 0, 
                    updatedAt: new Date(l.createdAt || Date.now()),
                    createdAt: new Date(l.createdAt || Date.now()),
                    filled: l.filled || 0,
                    quota: l.quota || 30,
                },
                {
                    packageType: l.guide?.package || "FREEMIUM",
                    trustScore: l.guide?.trustScore || 50,
                    completedTrips: l.guide?.completedTrips || 0,
                    isIdentityVerified: l.guide?.isIdentityVerified || false,
                    profileCompleteness: 50, 
                    avgResponseHours: 24, 
                    recentActivityCount: 1, 
                },
            ),
        }));

        scoredListings.sort((a, b) => (b._score || 0) - (a._score || 0));

        return NextResponse.json({
            data: scoredListings,
            metadata: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error("Fetch listings error:", error);
        throw new AppError("Failed to fetch listings", ERROR_CODES.INTERNAL_ERROR, 500);
    }
});

export const POST = withErrorHandler(async (req: Request) => {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const body = await req.json();
        const {
            title,
            description,
            city,
            quota,
            departureCityId,
            meetingCity,
            extraServices,
            hotelName,
            airlineId,
            pricing,
            startDate,
            endDate,
            totalDays,
            tourPlan,
            urgencyTag,
            legalConsent,
        } = body;

        if (!title || !departureCityId) {
            throw new AppError("Eksik alanlar mevcut.", ERROR_CODES.INVALID_QUERY, 400);
        }
        if (!legalConsent) {
            throw new AppError("Yasal sorumluluk beyanı zorunludur.", ERROR_CODES.INVALID_QUERY, 400);
        }

        const rl = await rateLimit(`listing:${session!.user.email}`, 300_000, 5);
        if (!rl.success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        if (pricing?.double && (pricing.double < 0 || pricing.double > 1_000_000)) {
            return NextResponse.json({ error: "Invalid price range" }, { status: 400 });
        }
        if (pricing?.triple && (pricing.triple < 0 || pricing.triple > 1_000_000)) {
            return NextResponse.json({ error: "Invalid price range" }, { status: 400 });
        }
        if (pricing?.quad && (pricing.quad < 0 || pricing.quad > 1_000_000)) {
            return NextResponse.json({ error: "Invalid price range" }, { status: 400 });
        }
        if (quota && (parseInt(quota) < 1 || parseInt(quota) > 500)) {
            return NextResponse.json({ error: "Invalid quota (1-500)" }, { status: 400 });
        }
        if (totalDays && (parseInt(totalDays) < 1 || parseInt(totalDays) > 60)) {
            return NextResponse.json({ error: "Invalid totalDays (1-60)" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const sanitizedDepartureCity = sanitizeCityName(String(departureCityId || "")) || "";
        const departureCityRecord = await prisma.departureCity.findFirst({
            where: {
                OR: [
                    { id: sanitizedDepartureCity },
                    { name: { equals: sanitizedDepartureCity } }
                ]
            }
        });
        if (!departureCityRecord) return NextResponse.json({ error: "Invalid Departure City" }, { status: 400 });

        // Upsert GuideProfile just to ensure relation exists, data is managed in User
        await prisma.guideProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id }
        });

        const currentListingsCount = await prisma.guideListing.count({
            where: { guideId: user.id, active: true }
        });
        
        const roleConfig = getRoleConfig(session!.user.role);
        if (currentListingsCount >= roleConfig.maxActiveListings) {
            return NextResponse.json({
                error: "Listing limit reached",
                message: `Rolünüz için maksimum ${roleConfig.maxActiveListings} aktif ilan oluşturabilirsiniz.`,
                code: "ROLE_LIMIT_REACHED"
            }, { status: 403 });
        }
        
        const userPkg = String(user.packageType);
        if (!(await PackageSystem.canCreateListing(userPkg, currentListingsCount))) {
            return NextResponse.json({
                error: "Limit Reached",
                message: "Paket limitinize ulaştınız. Daha fazla tur eklemek için paketinizi yükseltin.",
                code: "LIMIT_REACHED"
            }, { status: 403 });
        }

        try {
            await spendToken({
                userId: user.id,
                action: 'LISTING_CREATE',
                relatedId: `listing-create-${Date.now()}`,
                reason: 'Yeni ilan oluşturma',
            });
        } catch (error: any) {
            if (error.message.includes('Insufficient tickets') || error.message.includes('Insufficient balance')) {
                return NextResponse.json({
                    error: "Yetersiz Bakiye",
                    message: "İlan yayınlamak için yeterli jetonunuz bulunmuyor. Lütfen kredi yükleyin.",
                    code: "INSUFFICIENT_FUNDS"
                }, { status: 402 });
            }
            throw error;
        }

        const pDouble = pricing?.double || 0;
        const pTriple = pricing?.triple || 0;
        const pQuad = pricing?.quad || (body.price ? parseFloat(body.price) : 0);

        const newListing = await prisma.guideListing.create({
            data: {
                guideId: user.id,
                title,
                description: description || "",
                city: city || "",
                departureCityId: departureCityRecord.id,
                meetingCity: meetingCity || null,
                extraServices: Array.isArray(extraServices) ? extraServices : [],
                hotelName: hotelName || null,
                airlineId: airlineId || null,

                pricingDouble: pDouble,
                pricingTriple: pTriple,
                pricingQuad: pQuad,
                pricingCurrency: pricing?.currency || "SAR",
                quota: quota ? parseInt(quota) : 30,
                filled: 0,
                active: true,
                isFeatured: false,
                startDate: startDate ? new Date(startDate) : new Date(),
                departureDateEnd: body.departureDateEnd ? new Date(body.departureDateEnd) : null,
                endDate: endDate ? new Date(endDate) : new Date(Date.now() + 86400000 * 10),
                returnDateEnd: body.returnDateEnd ? new Date(body.returnDateEnd) : null,
                totalDays: totalDays ? parseInt(totalDays) : 10,
                approvalStatus: ApprovalStatus.PENDING,
                urgencyTag: urgencyTag || null,
                legalConsent: !!legalConsent,
                consentTimestamp: new Date(),
                tourDays: tourPlan && tourPlan.length > 0 ? {
                    create: tourPlan.map((d: any) => ({
                        day: d.day || 1,
                        city: d.city || "",
                        title: d.title || "",
                        description: d.description || ""
                    }))
                } : undefined
            },
            include: {
                tourDays: { orderBy: { day: 'asc' } }
            }
        });

        const response = {
            ...newListing,
            pricing: {
                double: Number(newListing.pricingDouble),
                triple: Number(newListing.pricingTriple),
                quad: Number(newListing.pricingQuad),
                currency: newListing.pricingCurrency
            },
            tourPlan: ((newListing as any).tourDays || []).map((d: any) => ({
                day: d.day,
                city: d.city,
                title: d.title,
                description: d.description
            })),
            startDate: newListing.startDate.toISOString().split('T')[0],
            endDate: newListing.endDate.toISOString().split('T')[0],
            createdAt: newListing.createdAt.toISOString()
        };

        return NextResponse.json({
            success: true,
            listing: response,
            message: "İlanınız kontrol ediliyor."
        }, { status: 201 });

    } catch (error) {
        console.error("Create listing error:", error);
        throw new AppError(safeErrorMessage(error), ERROR_CODES.INTERNAL_ERROR, 500);
    }
});
