import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/hero-section";
import { ToursGrid } from "@/components/tours-grid";
import { ToursSort } from "@/components/tours-sort";
import { Metadata } from "next";
import { fetchCachedListings } from "@/lib/cache/fetchCachedListings";
// NOTE: EmptyState must be defined. If it doesn't exist yet we fallback to text.

export const metadata: Metadata = {
  title: "Umre Turları | UmreBuldum",
  description: "Türkiye'nin en güvenilir umre tur karşılaştırma platformu",
};

export default async function ToursPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;
  
  // Create deterministic string from resolvedParams for hashing inside fetchCachedListings
  const queryToHash = resolvedParams ? Object.keys(resolvedParams)
    .sort()
    .map(key => `${key}=${resolvedParams[key]}`)
    .join('&') : 'default';

  // We wrap ALL database logic in the fetchCachedListings fetcher callback
  const fetchResult = await fetchCachedListings(queryToHash, async () => {
    const departureCityId = resolvedParams?.departureCity;
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

    if (departureCityId && departureCityId !== 'all') {
      where.departureCityId = departureCityId;
    }

    if (isIdentityVerifiedFilter === 'true') {
      where.guide = { isIdentityVerified: true };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (minDate || maxDate) {
      if (minDate) where.endDate = { gte: new Date(minDate as string) };
      if (maxDate) where.startDate = { lte: new Date(maxDate as string) };
    } else if (searchDate) {
      const parsedDate = new Date(searchDate as string);
      where.startDate = { lte: parsedDate };
      where.endDate = { gte: parsedDate };
    }

    const sortParam = resolvedParams?.sort || 'recommended';
    const orderBy: any[] = [];
    switch (sortParam) {
      case 'price_asc': orderBy.push({ price: 'asc' }); break;
      case 'price_desc': orderBy.push({ price: 'desc' }); break;
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
        guide: true,
        departureCity: true,
        airline: true,
        tourDays: { orderBy: { day: 'asc' } }
      },
      orderBy
    });

    // Filters are now pushed down to the database schema.

    // Transform logic mapping to the return object
    const transformedData = listings.map(l => {
      const profile = l.guide;
      return {
        id: l.id,
        guideId: l.guideId,
        title: l.title,
        description: l.description,
        city: l.city,
        departureCity: l.departureCity?.name || l.departureCityOld || "Unknown",
        meetingCity: l.meetingCity,
        extraServices: l.extraServices,
        hotelName: l.hotelName,
        airline: l.airline?.name || l.airlineOld || "Unknown",
        pricing: {
          double: l.pricingDouble,
          triple: l.pricingTriple,
          quad: l.pricingQuad,
          currency: l.pricingCurrency
        },
        price: l.price,
        quota: l.quota,
        filled: l.filled,
        active: l.active,
        isFeatured: l.isFeatured,
        startDate: l.startDate.toISOString().split('T')[0],
        endDate: l.endDate.toISOString().split('T')[0],
        totalDays: l.totalDays,
        tourPlan: l.tourDays.map(d => ({
          day: d.day,
          city: d.city,
          title: d.title,
          description: d.description
        })),
        image: l.image,
        createdAt: l.createdAt.toISOString(),
        guide: profile ? {
          fullName: profile.fullName,
          city: profile.city,
          bio: profile.bio,
          phone: profile.phone,
          isIdentityVerified: profile.isIdentityVerified,
          photo: profile.photo,
          trustScore: profile.trustScore || 50,
          completedTrips: profile.completedTrips || 0,
          package: profile.package || "FREEMIUM"
        } : null
      };
    });

    return {
      data: transformedData,
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

  return (
    <main className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Bulunan Turlar ({totalCount})</h2>
          <ToursSort />
        </div>
        
        {enrichedListings.length === 0 ? (
          <div className="text-center py-16 px-4 border rounded-xl bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-2">Tur Bulunamadı</h3>
            <p className="text-muted-foreground">Kriterlerinize uygun tur ilanımız şu anda mevcut değil. Lütfen aramanızı genişletin.</p>
          </div>
        ) : (
          <ToursGrid listings={enrichedListings} />
        )}
      </div>
    </main>
  );
}
