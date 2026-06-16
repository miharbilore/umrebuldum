export async function getTourBySlug(slug: string) {
    return {
        id: 1,
        title: "Mock Tour " + slug,
        slug: slug,
        departure_city: "İstanbul",
        duration: "14 Gün",
        agency_name: "Mock Turizm",
        featured_image: null,
        rating: 4.8,
        reviewCount: 15,
        hotels: [],
        itinerary: [],
        price: 1500,
        guide_name: "Mock Guide",
        guide_phone: "05555555555",
    };
}
