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
        { name: "Konya", airport: "Konya" },
        { name: "Kayseri", airport: "Erkilet" },
        { name: "Adana", airport: "Çukurova" },
        { name: "Gaziantep", airport: "Gaziantep" },
    ];

    const otherCities = [
        { name: "Antalya", airport: "Antalya" },
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

    for (const city of priorityCities) {
        await prisma.departureCity.upsert({
            where: { name: city.name },
            update: { priority: true, airport: city.airport },
            create: { ...city, priority: true },
        });
    }

    for (const city of otherCities) {
        await prisma.departureCity.upsert({
            where: { name: city.name },
            update: { priority: false, airport: city.airport },
            create: { ...city, priority: false },
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
