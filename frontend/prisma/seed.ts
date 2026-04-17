import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Seed default credit packages with dynamic features
    const packages = [
        { 
            id: "PLUS", 
            name: "Plus Paket", 
            credits: 70, 
            priceTRY: 299,
            features: ["14 İlan Eşdeğeri", "Öne Çıkarma Desteği", "Afiş/Poster Kullanımı"]
        },
        { 
            id: "PRO", 
            name: "Pro Paket", 
            credits: 105, 
            priceTRY: 699,
            features: ["21 İlan Eşdeğeri", "Öne Çıkarma Desteği", "Afiş/Poster Kullanımı"]
        },
        { 
            id: "VIP", 
            name: "VIP Paket", 
            credits: 150, 
            priceTRY: 1499,
            features: ["30 İlan Eşdeğeri", "7/24 Destek", "Afiş/Poster Kullanımı"]
        },
        { 
            id: "BUSINESS", 
            name: "Kurumsal Paket", 
            credits: 350, 
            priceTRY: 2999,
            features: ["70 İlan Eşdeğeri", "Hızlı Onay", "Kurumsal Fatura"]
        },
    ];

    for (const pkg of packages) {
        await prisma.creditPackage.upsert({
            where: { id: pkg.id },
            update: { features: pkg.features, credits: pkg.credits, priceTRY: pkg.priceTRY },
            create: pkg,
        });
    }

    console.log("✅ Seeded dynamic credit packages");

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
        { slug: "soguk-sezon-umre", name: "Kış Dönemi Umre" },
        { slug: "yaz-umresi", name: "Yaz Umresi" },
        { slug: "kisa-sureli-umre", name: "7-10 Gün Umre" },
        { slug: "uzun-sureli-umre", name: "14+ Gün Umre" },
        { slug: "aile-umresi", name: "Aileye Uygun Umre" },
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
