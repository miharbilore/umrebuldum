import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Seed default credit packages (4 approved tiers)
    const packages = [
        { 
            id: "FREEMIUM_GUIDE_1", 
            name: "Freemium", 
            credits: 15, 
            priceTRY: 0,
            slug: "FREEMIUM",
            roleTarget: "GUIDE" as const,
            features: { maxListings: 1, listingDays: 30, maxBoosts: 0, phoneVisible: false, canCreatePoster: false, priorityRanking: false, identityVerificationEligible: false }
        },
        { 
            id: "PREMIUM", 
            name: "Premium Paket", 
            credits: 50, 
            priceTRY: 199,
            slug: "PREMIUM",
            roleTarget: "GUIDE" as const,
            features: { maxListings: 3, listingDays: 60, maxBoosts: 1, phoneVisible: true, canCreatePoster: true, priorityRanking: false, identityVerificationEligible: true }
        },
        { 
            id: "PRO", 
            name: "Pro Paket", 
            credits: 200, 
            priceTRY: 699,
            slug: "PRO",
            roleTarget: "GUIDE" as const,
            features: { maxListings: 15, listingDays: 180, maxBoosts: 5, phoneVisible: true, canCreatePoster: true, priorityRanking: true, identityVerificationEligible: true, spotlightEligible: true }
        },
        { 
            id: "BUSINESS", 
            name: "Business Paket", 
            credits: 500, 
            priceTRY: 1299,
            slug: "BUSINESS",
            roleTarget: "ORGANIZATION" as const,
            features: { maxListings: 30, listingDays: 180, maxBoosts: 10, phoneVisible: true, canCreatePoster: true, priorityRanking: true, identityVerificationEligible: true, spotlightEligible: true }
        },
    ];

    for (const pkg of packages) {
        await prisma.creditPackage.upsert({
            where: { id: pkg.id },
            update: { name: pkg.name, features: pkg.features, credits: pkg.credits, priceTRY: pkg.priceTRY, slug: pkg.slug, roleTarget: pkg.roleTarget },
            create: { id: pkg.id, name: pkg.name, credits: pkg.credits, priceTRY: pkg.priceTRY, slug: pkg.slug, roleTarget: pkg.roleTarget, features: pkg.features },
        });
    }

    console.log("✅ Seeded credit packages (4 approved tiers)");

    // ─── Seed Departure Cities ──────────────────────────────────────────────

    const priorityCities = [
        { name: "İstanbul", airport: "İstanbul Havalimanı / Sabiha Gökçen" },
        { name: "Ankara", airport: "Esenboğa" },
        { name: "İzmir", airport: "Adnan Menderes" },
    ];

    const otherCities = [
        { name: "Adana", airport: "Çukurova" },
        { name: "Antalya", airport: "Antalya" },
        { name: "Gaziantep", airport: "Gaziantep" },
        { name: "Kayseri", airport: "Erkilet" },
        { name: "Konya", airport: "Konya" },
        { name: "Trabzon", airport: "Trabzon" },
        { name: "Samsun", airport: "Çarşamba" },
        { name: "Diyarbakır", airport: "Diyarbakır" },
        { name: "Malatya", airport: "Erhaç" },
        { name: "Erzurum", airport: "Erzurum" },
        { name: "Van", airport: "Ferit Melen" },
        { name: "Hatay", airport: "Hatay" },
        { name: "Şanlıurfa", airport: "GAP" },
        { name: "Mardin", airport: "Mardin" },
        { name: "Elazığ", airport: "Elazığ" },
        { name: "Batman", airport: "Batman" },
        { name: "Kahramanmaraş", airport: "Kahramanmaraş" },
    ];

    const sanitizeName = (name: string) => name.replace(/\*/g, "").trim();

    for (const city of priorityCities) {
        const name = sanitizeName(city.name);
        await prisma.departureCity.upsert({
            where: { name },
            update: { priority: true, airport: city.airport, name },
            create: { ...city, name, priority: true },
        });
    }

    for (const city of otherCities) {
        const name = sanitizeName(city.name);
        await prisma.departureCity.upsert({
            where: { name },
            update: { priority: false, airport: city.airport, name },
            create: { ...city, name, priority: false },
        });
    }
    console.log("✅ Seeded departure cities");

    // ─── Seed Airlines ──────────────────────────────────────────────────────

    const charterAirlines = [
        "Türk Hava Yolları", "AJet", "SunExpress", "Freebird Airlines", "Tailwind Airlines"
    ];
    const otherAirlines = [
        "Pegasus Airlines", "Corendon Airlines"
    ];

    for (const name of charterAirlines) {
        await prisma.airline.upsert({
            where: { name },
            update: { isCharterFriendly: true },
            create: { name, isCharterFriendly: true },
        });
    }

    for (const name of otherAirlines) {
        await prisma.airline.upsert({
            where: { name },
            update: { isCharterFriendly: false },
            create: { name, isCharterFriendly: false },
        });
    }
    console.log("✅ Seeded airlines");

    // ─── Seed Listing Categories (SEO + Filtering) ─────────────────────────

    const listingCategories = [
        { slug: "ekonomik-umre", name: "Ekonomik Umre" },
        { slug: "standart-umre", name: "Standart Umre" },
        { slug: "vip-umre", name: "VIP Umre" },
        { slug: "5-yildiz-umre", name: "5 Yıldız Otel Umre" },
        { slug: "ramazan-umresi", name: "Ramazan Umresi" },
        { slug: "soguk-sezon-umre", name: "Soğuk Sezon (Kış) Umresi" },
        { slug: "yaz-umresi", name: "Yaz Umresi" },
        { slug: "kisa-sureli-umre", name: "Kısa Süreli Umre" },
        { slug: "uzun-sureli-umre", name: "Uzun Süreli Umre" },
        { slug: "aile-umresi", name: "Aile Umresi" },
        { slug: "genclere-ozel-umre", name: "Gençlere Özel Umre" },
    ];

    for (const category of listingCategories) {
        await prisma.listingCategory.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    console.log("✅ Seeded listing categories");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
