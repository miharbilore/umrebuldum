import { prisma } from "@/lib/prisma";
import { sanitizeCityName } from "@/lib/city-utils";

export async function getTourBySlug(slug: string) {
    const listing = await prisma.guideListing.findUnique({
        where: { id: slug },
        include: {
            guide: { include: { user: true } },
            departureCity: true,
            airline: true,
            tourDays: { orderBy: { day: 'asc' } }
        }
    });

    if (!listing) return null;

    const profile = listing.guide;
    
    return {
        id: listing.id,
        title: listing.title,
        slug: slug,
        departure_city: sanitizeCityName(listing.departureCity?.name || listing.city) || "Bilinmiyor",
        duration: `${listing.totalDays} Gün`,
        agency_name: profile?.user?.fullName || "Acente",
        featured_image: listing.image,
        rating: Number(profile?.averageRating || 0),
        reviewCount: profile?.reviewCount || 0,
        hotels: listing.hotelName ? [{ name: listing.hotelName }] : [],
        itinerary: listing.tourDays.map(d => ({
            day: d.day,
            city: sanitizeCityName(d.city) || "",
            title: d.title,
            description: d.description
        })),
        price: Number(listing.pricingQuad),
        guide_name: profile?.user?.fullName || "Rehber",
        guide_phone: profile?.user?.phone || null,
    };
}
