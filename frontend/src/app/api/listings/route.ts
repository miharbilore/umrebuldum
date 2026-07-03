import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PackageSystem } from "@/lib/package-system";
import { requireSupply } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { Prisma, ApprovalStatus, PackageTier } from "@/../prisma/generated-client";
import { getRoleConfig } from "@/lib/role-config";
import { safeErrorMessage } from "@/lib/safe-error";
import { rankListings, scoreListing, detectQueryIntent } from "@/modules/ranking/ranking-engine";
import { spendToken } from "@/modules/tokens";
import { sanitizeCityName } from "@/lib/city-utils";

import { withErrorHandler } from "@/lib/errors/api-handler";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";

export const GET = withErrorHandler(async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const guideId = searchParams.get('guideId');
        const rawCity = searchParams.get('city');
        const city = sanitizeCityName(rawCity) || null;
        const departureCityParam = searchParams.get('departureCity') || searchParams.get('departureCityId');
        const departureCity = sanitizeCityName(departureCityParam) || null;
        const searchDate = searchParams.get('date');
        const minDate = searchParams.get('minDate');
        const maxDate = searchParams.get('maxDate');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const isIdentityVerifiedFilter = searchParams.get('isIdentityVerified');
        let page = parseInt(searchParams.get('page') || '1', 10);
        let limit = parseInt(searchParams.get('limit') || '20', 10);

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 20;

        const skip = (page - 1) * limit;

        const now = new Date();
        const toTurkishTitleCase = (value: string) =>
            value
                .toLocaleLowerCase("tr-TR")
                .split(" ")
                .map((word) => (word ? `${word[0].toLocaleUpperCase("tr-TR")}${word.slice(1)}` : ""))
                .join(" ");

        // Build where clause
        const where: Prisma.GuideListingWhereInput = {
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
        const activeCitySearch = departureCity || city;
        if (activeCitySearch && activeCitySearch.toLowerCase() !== 'all') {
            const trimmedCity = activeCitySearch.trim();
            const normalizedCity = toTurkishTitleCase(trimmedCity);
            const cityCandidates = Array.from(new Set([trimmedCity, normalizedCity]));

            appendAndFilter({
                OR: [
                    { departureCity: { name: { in: cityCandidates } } },
                    { guide: { user: { city: { in: cityCandidates } } } },
                    { city: { in: cityCandidates } }
                ]
            });
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
            // Dynamic window: Show tours ending after search date AND starting before search date + 60 days
            // This ensures we get a wide pool for proximity ranking
            const futureLimit = new Date(parsedDate.getTime() + 60 * 86400000);
            const pastLimit = new Date(parsedDate.getTime() - 30 * 86400000);
            
            appendAndFilter({
                endDate: { gte: new Date(searchDate) },
                startDate: { lte: futureLimit }
            });
        }

        const totalCount = await prisma.guideListing.count({ where });

        const listings = await prisma.guideListing.findMany({
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
                    agencyCity: guideUser.city || "",
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

        // ── Ranking Engine v3 Integration ───────────────────────────────
        const intent = detectQueryIntent({
            city: activeCitySearch || undefined,
            date: searchDate || undefined,
            priceMin: minPrice ? parseFloat(minPrice) : undefined,
            priceMax: maxPrice ? parseFloat(maxPrice) : undefined
        });

        const scoredResults = enrichedListings.map(l => {
            const rankingListing = {
                id: l.id,
                type: "GUIDE_PROFILE" as const,
                createdAt: new Date(l.createdAt),
                updatedAt: new Date(l.createdAt),
                filled: l.filled || 0,
                quota: l.quota || 30,
                price: l.price,
                city: l.city,
                departureCity: l.departureCity,
                startDate: new Date(l.startDate),
                endDate: new Date(l.endDate)
            };

            const rankingGuide = {
                userId: l.guideId,
                packageType: l.guide?.package || "FREEMIUM",
                isIdentityVerified: l.guide?.isIdentityVerified || false,
                trustScore: l.guide?.trustScore || 50,
                completedTrips: l.guide?.completedTrips || 0,
                profileCompleteness: 70,
                avgResponseHours: 12,
                recentActivityCount: 5,
                avgReviewRating: l.guide?.averageRating || 0,
                reviewCount: l.guide?.reviewCount || 0,
                accountAgeDays: 30,
                totalListingsCreated: 1,
                agencyCity: l.guide?.agencyCity || ""
            };

            const boost = {
                isActive: l.isFeatured || false,
                effectivePower: 1.0,
                activeBoostCount: 1,
                boostTier: "BASIC" as const
            };

            return scoreListing(
                rankingListing,
                rankingGuide,
                boost,
                null, 
                null, 
                intent
            );
        });

        const rankedResults = rankListings(scoredResults);
        
        const finalResults = rankedResults.map(r => {
            const original = enrichedListings.find(l => l.id === r.listingId);
            return {
                ...original,
                _score: r.finalScore,
                _rank: r.position,
                _breakdown: r.breakdown
            };
        });

        return NextResponse.json({
            data: finalResults,
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

interface TourDayInput {
    day?: number;
    city?: string;
    title?: string;
    description?: string;
}

interface CreateListingRequest {
    title: string;
    description?: string;
    city?: string;
    departureCity?: string;
    quota?: string | number;
    departureCityId?: string;
    meetingCity?: string;
    extraServices?: string[];
    hotelName?: string;
    airlineId?: string;
    pricing?: {
        double?: number;
        triple?: number;
        quad?: number;
        currency?: string;
    };
    price?: string | number;
    startDate?: string | Date;
    departureDateEnd?: string | Date;
    endDate?: string | Date;
    returnDateEnd?: string | Date;
    totalDays?: string | number;
    tourPlan?: TourDayInput[];
    urgencyTag?: string;
    legalConsent: boolean;
    category?: string;
}

export const POST = withErrorHandler(async (req: Request) => {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const body = (await req.json()) as CreateListingRequest;
        const {
            title,
            description,
            city,
            departureCity,
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
            category,
        } = body;

        if (!title || (!departureCityId && !departureCity)) {
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
        if (quota && (parseInt(String(quota)) < 1 || parseInt(String(quota)) > 500)) {
            return NextResponse.json({ error: "Invalid quota (1-500)" }, { status: 400 });
        }
        if (totalDays && (parseInt(String(totalDays)) < 1 || parseInt(String(totalDays)) > 60)) {
            return NextResponse.json({ error: "Invalid totalDays (1-60)" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const sanitizedDepartureCity = sanitizeCityName(String(departureCity || departureCityId || "")) || "";
        
        const departureCityRecord = await prisma.departureCity.findFirst({
            where: {
                OR: [
                    { id: sanitizedDepartureCity },
                    { name: sanitizedDepartureCity }
                ]
            }
        });

        if (!departureCityRecord) {
            return NextResponse.json({ error: "Lütfen listeden geçerli bir kalkış şehri seçiniz." }, { status: 400 });
        }

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
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes('Insufficient tickets') || error.message.includes('Insufficient balance')) {
                    return NextResponse.json({
                        error: "Yetersiz Bakiye",
                        message: "İlan yayınlamak için yeterli tokeniniz bulunmuyor. Lütfen kredi yükleyin.",
                        code: "INSUFFICIENT_FUNDS"
                    }, { status: 402 });
                }
            }
            throw error;
        }

        const pDouble = pricing?.double || 0;
        const pTriple = pricing?.triple || 0;
        const pQuad = pricing?.quad || (body.price ? parseFloat(String(body.price)) : 0);

        const newListing = await prisma.guideListing.create({
            data: {
                guideId: user.id,
                title,
                description: description || "",
                city: city || "",
                category: category || null,
                departureCityId: departureCityRecord.id,
                meetingCity: meetingCity || null,
                extraServices: Array.isArray(extraServices) ? extraServices : [],
                hotelName: hotelName || null,
                airlineId: airlineId || null,

                pricingDouble: pDouble,
                pricingTriple: pTriple,
                pricingQuad: pQuad,
                pricingCurrency: pricing?.currency || "SAR",
                quota: quota ? (typeof quota === "string" ? parseInt(quota) : quota) : 30,
                filled: 0,
                active: true,
                isFeatured: false,
                startDate: startDate ? new Date(startDate) : new Date(),
                departureDateEnd: body.departureDateEnd ? new Date(body.departureDateEnd) : null,
                endDate: endDate ? new Date(endDate) : new Date(Date.now() + 86400000 * 10),
                returnDateEnd: body.returnDateEnd ? new Date(body.returnDateEnd) : null,
                totalDays: totalDays ? (typeof totalDays === "string" ? parseInt(totalDays) : totalDays) : 10,
                approvalStatus: ApprovalStatus.PENDING,
                urgencyTag: urgencyTag || null,
                legalConsent: !!legalConsent,
                consentTimestamp: new Date(),
                tourDays: tourPlan && tourPlan.length > 0 ? {
                    create: tourPlan.map((d: TourDayInput) => ({
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
            tourPlan: newListing.tourDays ? newListing.tourDays.map((d: { day: number, city: string | null, title: string | null, description: string | null }) => ({
                day: d.day,
                city: d.city,
                title: d.title,
                description: d.description
            })) : [],
            startDate: newListing.startDate.toISOString().split('T')[0],
            endDate: newListing.endDate.toISOString().split('T')[0],
            createdAt: newListing.createdAt.toISOString()
        };

        return NextResponse.json({
            success: true,
            listing: response,
            message: "İlanınız kontrol ediliyor."
        }, { status: 201 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Create listing error:", error.message);
            throw new AppError(error.message, ERROR_CODES.INTERNAL_ERROR, 500);
        }
        console.error("Create listing error:", error);
        throw new AppError("Internal Server Error", ERROR_CODES.INTERNAL_ERROR, 500);
    }
});
