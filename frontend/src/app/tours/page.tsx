import { prisma } from "@/lib/prisma";
import { SearchSummaryBar } from "@/components/search-summary-bar";
import { ToursGrid } from "@/components/tours-grid";
import { ToursSort } from "@/components/tours-sort";
import { ToursFilter } from "@/components/tours-filter";
import { Metadata } from "next";
import Script from "next/script";
import { Search } from "lucide-react";
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
  
  // Hash for caching
  const queryToHash = resolvedParams ? Object.keys(resolvedParams)
    .sort()
    .map(key => `${key}=${resolvedParams[key]}`)
    .join('&') : 'default';

  let fetchResult;
  try {
    fetchResult = await fetchCachedListings(queryToHash, async () => {
      const departureCityParam = resolvedParams?.departureCity;
      const searchDate = resolvedParams?.date;
      const minPrice = resolvedParams?.minPrice;
      const maxPrice = resolvedParams?.maxPrice;
      const categoryFilter = resolvedParams?.category;
      const daysFilter = resolvedParams?.days; // e.g., "7-10,14,20+"
      const sortParam = resolvedParams?.sort || 'recommended';
      
      const page = parseInt(resolvedParams?.page || '1', 10);
      const limit = parseInt(resolvedParams?.limit || '20', 10);
      const skip = (page - 1) * limit;

      const now = new Date();

      const where: any = {
        active: true,
        approvalStatus: 'APPROVED',
        endDate: { gte: now }
      };

      // 1. City Filter
      const searchCity = sanitizeCityName(resolvedParams?.city || resolvedParams?.departureCity) || null;
      if (searchCity && searchCity.toLowerCase() !== 'all') {
        where.OR = [
          { departureCity: { name: { contains: searchCity } } },
          { guide: { user: { city: { contains: searchCity } } } },
          { city: { contains: searchCity } }
        ];
      }

      // 2. Category Filter
      if (categoryFilter && categoryFilter !== 'all') {
         where.category = categoryFilter;
      }

      // 3. Price Filter
      if (minPrice || maxPrice) {
        where.pricingQuad = {};
        if (minPrice) where.pricingQuad.gte = parseFloat(minPrice as string);
        if (maxPrice) where.pricingQuad.lte = parseFloat(maxPrice as string);
      }

      // 4. Duration Filter (Süre)
      if (daysFilter) {
        const daysArray = daysFilter.split(',');
        const durationConditions: any[] = [];
        
        if (daysArray.includes('7-10')) {
          durationConditions.push({ totalDays: { gte: 7, lte: 10 } });
        }
        if (daysArray.includes('14')) {
          durationConditions.push({ totalDays: 14 });
        }
        if (daysArray.includes('20+')) {
          durationConditions.push({ totalDays: { gte: 20 } });
        }

        if (durationConditions.length > 0) {
          if (where.OR) {
            // If we already have a city OR, we need to wrap both in AND
            const existingOR = where.OR;
            delete where.OR;
            where.AND = [
              { OR: existingOR },
              { OR: durationConditions }
            ];
          } else {
            where.OR = durationConditions;
          }
        }
      }

      // 5. Date Filter
      if (searchDate) {
        const parsedDate = new Date(searchDate as string);
        const futureLimit = new Date(parsedDate.getTime() + 90 * 86400000);
        where.endDate = { gte: parsedDate };
        where.startDate = { lte: futureLimit };
      }

      // 6. Sorting
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

      // Ranking Engine
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
          reviewCount: 0,
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
        return { ...original, _score: r.finalScore };
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
    }, 300);
  } catch (error: any) {
    console.error("[ToursPage] CRITICAL ERROR in fetchCachedListings:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    throw error;
  }

  const enrichedListings = fetchResult?.data || [];
  const totalCount = fetchResult?.metadata?.totalCount || 0;

  return (
    <main className="min-h-screen bg-slate-50/50">
      <SearchSummaryBar 
        city={resolvedParams?.departureCity} 
        date={resolvedParams?.date} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filter - E-commerce style */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <ToursFilter
                currentCity={resolvedParams?.departureCity}
                currentMinPrice={resolvedParams?.minPrice}
                currentMaxPrice={resolvedParams?.maxPrice}
                currentDate={resolvedParams?.date}
                currentCategory={resolvedParams?.category}
                currentDays={resolvedParams?.days}
                currentSort={resolvedParams?.sort}
            />
          </aside>

          {/* Main Results grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Umre Paketleri</h2>
                <p className="text-slate-500 font-medium mt-1">
                  Seçimlerinize uygun <span className="text-primary font-bold">{totalCount}</span> sonuç listeleniyor.
                </p>
              </div>
            </div>

            {enrichedListings.length === 0 ? (
              <div className="text-center py-32 px-4 border border-dashed border-slate-200 rounded-[3rem] bg-white">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 mb-6">
                  <Search className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Sonuç Bulunamadı</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  Aradığınız kriterlerde aktif tur ilanı bulunmuyor. Farklı filtreler denemeye ne dersiniz?
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
