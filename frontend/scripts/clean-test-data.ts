import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanTestData() {
    console.log("🧹 Veri Temizliği Operasyonu Başlatıldı...");
    console.log("⚠️  Sadece ilanlar ve test kullanıcıları silinecek. Temel veriler korunacak.\n");

    try {
        // 1. İlan Verileri Temizliği (Tüm ilanlar)
        console.log("--- Tüm İlanlar (GuideListing) siliniyor ---");
        
        // Önce ilişkili alt tabloları temizleyelim (Garanti olsun)
        await prisma.tourDay.deleteMany({});
        await prisma.listingSeo.deleteMany({});
        await prisma.activeBoost.deleteMany({});
        await prisma.listingBoostCounter.deleteMany({});
        await prisma.listingImpression.deleteMany({});
        await prisma.listingClick.deleteMany({});
        await prisma.spotlightPlacement.deleteMany({});
        
        const deleteListingsResult = await prisma.guideListing.deleteMany({});
        console.log(`✅ Silinen ilan sayısı: ${deleteListingsResult.count}`);

        // 2. Test Kullanıcıları Temizliği
        console.log("\n--- Test kullanıcıları temizleniyor ---");
        
        // Test kullanıcılarını belirle: umrebuldum.com uzantılı veya "test" içerenler
        const testUserCondition = {
            OR: [
                { email: { endsWith: "@umrebuldum.com" } },
                { email: { contains: "test" } },
                { name: { contains: "test" } },
                { fullName: { contains: "test" } }
            ],
            // Adminleri silmeyelim (Eğer özel bir test admini değilse)
            NOT: [
                { email: "admin@umrebuldum.com" } // Ana admini koru
            ]
        };

        // İlişkili verileri temizle (Cascade bazen deleteMany'de çalışmaz)
        const testUsers = await prisma.user.findMany({
            where: testUserCondition,
            select: { id: true, email: true }
        });

        const testUserIds = testUsers.map(u => u.id);
        console.log(`🔍 Tespit edilen test kullanıcısı sayısı: ${testUsers.length}`);

        if (testUserIds.length > 0) {
            console.log("   Test kullanıcılarına bağlı profiller, mesajlar ve talepler temizleniyor...");
            await prisma.guideProfile.deleteMany({ where: { userId: { in: testUserIds } } });
            await prisma.account.deleteMany({ where: { userId: { in: testUserIds } } });
            await prisma.session.deleteMany({ where: { userId: { in: testUserIds } } });
            await prisma.notification.deleteMany({ where: { userId: { in: testUserIds } } });
            await prisma.tokenTransaction.deleteMany({ where: { userId: { in: testUserIds } } });
            await prisma.transaction.deleteMany({ where: { userId: { in: testUserIds } } });
            
            // Talepleri ve mesajları temizleyelim (Eğer test kullanıcılarına bağlıysa)
            await prisma.message.deleteMany({ where: { senderId: { in: testUserIds } } });
            await prisma.conversation.deleteMany({ 
                where: { 
                    OR: [
                        { guideId: { in: testUserIds } },
                        { userId: { in: testUserIds } }
                    ]
                } 
            });

            const deleteUsersResult = await prisma.user.deleteMany({
                where: testUserCondition
            });
            console.log(`✅ Başarıyla silinen test kullanıcısı sayısı: ${deleteUsersResult.count}`);
        }

        console.log("\n--- Korunan Veri Kontrolü ---");
        const cityCount = await prisma.departureCity.count();
        const categoryCount = await prisma.listingCategory.count();
        const airlineCount = await prisma.airline.count();
        
        console.log(`📍 Korunan Şehir Sayısı: ${cityCount}`);
        console.log(`📁 Korunan Kategori Sayısı: ${categoryCount}`);
        console.log(`✈️  Korunan Hava Yolu Sayısı: ${airlineCount}`);

        console.log("\n🚀 Temizlik tamamlandı! Sistem artık temiz test/canlı verisi için hazır.");

    } catch (error) {
        console.error("❌ Temizlik işlemi sırasında hata oluştu:", error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanTestData();
