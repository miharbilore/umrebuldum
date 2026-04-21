import { PrismaClient, UserRole, ApprovalStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "test-rehber@umrebuldum.com";
    const name = "Test Rehber";

    // 1. Create or Update Test Guide User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: "GUIDE" as UserRole,
            isApproved: true,
            isVerified: true,
            phone: "+905550001234",
            name: name,
        },
        create: {
            email,
            name,
            role: "GUIDE" as UserRole,
            isApproved: true,
            isVerified: true,
            phone: "+905550001234",
        },
    });

    // 2. Create Guide Profile if not exists
    await prisma.guideProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            experienceYears: 5,
            languagesSpoken: ["Türkçe", "Arapça"],
        },
    });

    console.log(`✅ User ${email} is ready.`);

    // 3. Clear old TEST listings for this user (to keep it clean)
    await prisma.guideListing.deleteMany({
        where: { 
            guideId: user.id,
            title: { contains: "TEST" }
        }
    });

    // 4. Create 5 TEST listings
    const cats = await prisma.listingCategory.findMany({ take: 5 });
    const cities = await prisma.departureCity.findMany({ take: 3 });

    const tourData = [
        { title: "TEST - İstanbul Çıkışlı Ekonomik Umre", city: "İstanbul", cat: "ekonomik-umre", price: 1500, days: 10 },
        { title: "TEST - Ankara Çıkışlı VIP Umre", city: "Ankara", cat: "vip-umre", price: 2500, days: 7 },
        { title: "TEST - İzmir Çıkışlı Standart Umre", city: "İzmir", cat: "standart-umre", price: 1800, days: 15 },
        { title: "TEST - İstanbul Çıkışlı 5 Yıldız Umre", city: "İstanbul", cat: "5-yildiz-umre", price: 3000, days: 14 },
        { title: "TEST - Ankara Çıkışlı Ramazan Umresi", city: "Ankara", cat: "ramazan-umresi", price: 3500, days: 30 },
    ];

    for (let i = 0; i < tourData.length; i++) {
        const item = tourData[i];
        const categorySlug = cats.find(c => c.slug === item.cat)?.slug || cats[0].slug;
        const departureCityId = cities.find(c => c.name === item.city)?.id || cities[0].id;

        await prisma.guideListing.create({
            data: {
                guideId: user.id,
                title: item.title,
                description: `Bu bir test ilanıdır. ${item.title} için detaylı açıklama burada yer alır.`,
                city: item.city,
                departureCityId: departureCityId,
                category: categorySlug,
                pricingDouble: item.price,
                pricingCurrency: "SAR",
                startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
                totalDays: item.days,
                active: true,
                approvalStatus: "APPROVED" as ApprovalStatus,
                extraServices: ["Otel Transferi", "Zemzem Suyu"],
                hotelName: "Test Hotel " + (i + 1),
            }
        });
    }

    console.log("✅ 5 TEST listings created.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
