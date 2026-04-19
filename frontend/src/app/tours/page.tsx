import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/hero-section";
import { ToursGrid } from "@/components/tours-grid";
import { ToursSort } from "@/components/tours-sort";
import { ToursFilter } from "@/components/tours-filter";
import { Metadata } from "next";
import Script from "next/script";
import { fetchCachedListings } from "@/lib/cache/fetchCachedListings";
import { sanitizeCityName } from "@/lib/city-utils";
import { ApprovalStatus, Prisma } from "@prisma/client";
import { rankListings, scoreListing, detectQueryIntent } from "@/modules/ranking/ranking-engine";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Umre Turları | UmreBuldum",
    description: "Türkiye'nin en güvenilir umre tur karşılaştırma platformu",
    alternates: {
      canonical: "https://umrebuldum.com/tours",
    },
    openGraph: {
      title: "Umre Turları | UmreBuldum",
      description: "Türkiye'nin en güvenilir umre tur karşılaştırma platformu",
      url: "https://umrebuldum.com/tours",
    },
    twitter: {
      card: "summary_large_image",
      title: "Umre Turları | UmreBuldum",
      description: "Türkiye'nin en güvenilir umre tur karşılaştırma platformu",
    },
  };
}

export default async function ToursPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;
  
  // Create deterministic string from resolvedParams for hashing inside fetchCachedListings
  const queryToHash = resolvedParams ? Object.keys(resolvedParams)
    .sort()
    .map(key => `${key}=${resolvedParams[key]}`)
    .join('&') : 'default';

  // We wrap ALL database logic in the fetchCachedListings fetcher callback
  const fetchResult = await fetchCachedListings(queryToHash, async () => {
    const departureCityParam = resolvedParams?.departureCity;
    const searchDate = resolvedParams?.date;
    const minDate = resolvedParams?.minDate;
    const maxDate = resolvedParams?.maxDate;
    const minPrice = resolvedParams?.minPrice;
    const maxPrice = resolvedParams?.maxPrice;
    const isIdentityVerifiedFilter = resolvedParams?.isIdentityVerified;
    const page = parseInt(resolvedParams?.page || '1', 10);
    const limit = parseInt(resolvedParams?.limit || '20', 10);
    const skip = (page - 1) * limit;

    const now = new Date();

    const where: any = {
      active: true,
      approvalStatus: 'APPROVED',
      endDate: { gte: now }
    };

    const searchCity = sanitizeCityName(resolvedParams?.city || resolvedParams?.departureCity) || null;
    if (searchCity && searchCity.toLowerCase() !== 'all') {
      where.OR = [
        { departureCity: { name: { contains: searchCity } } },
        { guide: { user: { city: { contains: searchCity } } } },
        { city: { contains: searchCity } }
      ];
    }

    if (isIdentityVerifiedFilter === 'true') {
      where.guide = { user: { isIdentityVerified: true } };
    }

    if (minPrice || maxPrice) {
      where.pricingQuad = {};
      if (minPrice) where.pricingQuad.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricingQuad.lte = parseFloat(maxPrice as string);
    }

    if (minDate || maxDate) {
      if (minDate) where.endDate = { gte: new Date(minDate as string) };
      if (maxDate) where.startDate = { lte: new Date(maxDate as string) };
    } else if (searchDate) {
      const parsedDate = new Date(searchDate as string);
      const futureLimit = new Date(parsedDate.getTime() + 90 * 86400000);
      where.endDate = { gte: parsedDate };
      where.startDate = { lte: futureLimit };
    }

    const sortParam = resolvedParams?.sort || 'recommended';
    const orderBy: any[] = [];
    switch (sortParam) {
      case 'price_asc': orderBy.push({ pricingQuad: 'asc' }); break;
      case 'price_desc': orderBy.push({ pricingQuad: 'desc' }); break;
      case 'date_asc': orderBy.push({ startDate: 'asc' }); break;
      case 'date_desc': orderBy.push({ startDate: 'desc' }); break;
      case 'recommended':
      default:
        orderBy.push({ isFeatured: 'desc' });
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    const totalCount = await prisma.guideListing.count({ where });

    let listings = await prisma.guideListing.findMany({
      where,
      take: limit,
      skip: skip,
      include: {
        guide: { include: { user: true } },
        departureCity: true,
        airline: true,
        tourDays: { orderBy: { day: 'asc' } }
      },
      orderBy
    });

    // Transform logic mapping to the return object
    const transformedData = listings.map(l => {
      const profile = l.guide;
      return {
        id: l.id,
        guideId: l.guideId,
        title: l.title,
        description: l.description,
        city: sanitizeCityName(l.city) || "",
        departureCity: sanitizeCityName(l.departureCity?.name || l.city) || "Unknown",
        meetingCity: sanitizeCityName(l.meetingCity),
        extraServices: l.extraServices,
        hotelName: l.hotelName,
        airline: l.airline?.name || "Unknown",
        pricing: {
          double: l.pricingDouble.toString(),
          triple: l.pricingTriple.toString(),
          quad: l.pricingQuad.toString(),
          currency: l.pricingCurrency
        },
        price: l.pricingQuad.toString(),
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
        image: l.image,
        createdAt: l.createdAt.toISOString(),
        guide: profile ? {
          fullName: profile.user.fullName,
          city: profile.user.city,
          agencyCity: profile.user.city || "",
          photo: profile.user.photo,
          isIdentityVerified: profile.user.isIdentityVerified,
          trustScore: profile.user.trustScore,
          package: profile.user.packageType,
          completedTrips: profile.user.completedTrips,
          averageRating: Number(profile.averageRating)
        } : null
      };
    });

    // ── Ranking Engine Integration ──────────────────────────────────
    // Variables (searchCity, searchDate, minPrice, maxPrice) are reused from outer scope in the same callback
    const intent = detectQueryIntent({
      city: searchCity || undefined,
      date: (searchDate as string) || undefined,
      priceMin: minPrice ? parseFloat(minPrice as string) : undefined,
      priceMax: maxPrice ? parseFloat(maxPrice as string) : undefined
    });

    const scoredResults = transformedData.map(l => {
      const rankingListing = {
        id: l.id,
        type: "GUIDE_PROFILE" as const,
        createdAt: new Date(l.createdAt),
        updatedAt: new Date(l.createdAt),
        filled: l.filled || 0,
        quota: l.quota || 30,
        price: Number(l.price),
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
        agencyCity: l.guide?.city || ""
      };

      const boost = {
        isActive: l.isFeatured || false,
        effectivePower: 1.0,
        activeBoostCount: 1,
        boostTier: "BASIC" as const
      };

      return scoreListing(rankingListing, rankingGuide, boost, null, null, intent);
    });

    const rankedResults = rankListings(scoredResults);
    
    const enrichedListings = rankedResults.map(r => {
      const original = transformedData.find(l => l.id === r.listingId);
      return { 
        ...original, 
        _score: r.finalScore,
        _breakdown: r.breakdown 
      };
    });

    return {
      data: enrichedListings,
      metadata: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }, 300); // end of fetchCachedListings (300s TTL)

  const enrichedListings = fetchResult?.data || [];
  const totalCount = fetchResult?.metadata?.totalCount || 0;
  const toursSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Umre Turları",
    serviceType: "Umre Turu",
    url: "https://umrebuldum.com/tours",
    provider: {
      "@type": "Organization",
      name: "Umrebuldum",
      url: "https://umrebuldum.com",
    },
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Script
        id="tours-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toursSchema) }}
      />
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <div className="w-full lg:w-1/4">
            <ToursFilter
              currentCity={resolvedParams?.departureCity}
              currentMinPrice={resolvedParams?.minPrice}
              currentMaxPrice={resolvedParams?.maxPrice}
              currentDate={resolvedParams?.date}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-xl border shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bulunan Turlar</h2>
                <p className="text-gray-500 text-sm mt-1">Kriterlerinize uygun {totalCount} ilan bulundu</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Sırala:</span>
                <ToursSort />
              </div>
            </div>

            {enrichedListings.length === 0 ? (
              <div className="text-center py-20 px-4 border rounded-2xl bg-white shadow-sm">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <FilterIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tur Bulunamadı</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Seçtiğiniz tarihte veya şehirde aktif tur ilanımız şu anda mevcut değil. Lütfen filtreleri esnetmeyi deneyin.
                </p>
              </div>
            ) : (
              <ToursGrid listings={enrichedListings} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function FilterIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="12" x="2" y="3" rx="2" />
      <path d="M12 15v5" />
      <path d="M12 21h0" />
      <path d="M4 11h16" />
    </svg>
  );
}
