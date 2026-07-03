import { PrismaClient } from '../prisma/generated-client';

const prisma = new PrismaClient();

async function nuclearReset() {
    console.log("🚀 Nuclear Reset Operasyonu Başlatıldı...");
    console.log("⚠️  Dikkat: Admin kullanıcıları hariç tüm operasyonel veriler silinecek.\n");

    try {
        // 1. Yazışmalar ve Mesajlaşma
        console.log("--- Yazışmalar temizleniyor ---");
        await prisma.moderationLog.deleteMany({});
        await prisma.message.deleteMany({});
        await prisma.conversation.deleteMany({});

        // 2. Talepler ve Teklifler
        console.log("--- Talepler ve Teklifler temizleniyor ---");
        await prisma.offer.deleteMany({});
        await prisma.requestInterest.deleteMany({});
        await prisma.requestFavorite.deleteMany({});
        await prisma.leadRoutingLog.deleteMany({});
        await prisma.umrahRequest.deleteMany({});

        // 3. İlanlar ve İlişkili Veriler
        console.log("--- İlan verileri temizleniyor ---");
        await prisma.tourDay.deleteMany({});
        await prisma.listingSeo.deleteMany({});
        await prisma.activeBoost.deleteMany({});
        await prisma.listingBoostCounter.deleteMany({});
        await prisma.listingImpression.deleteMany({});
        await prisma.listingClick.deleteMany({});
        await prisma.spotlightPlacement.deleteMany({});
        await prisma.guideListing.deleteMany({});

        // 4. Ekonomi ve Jeton İşlemleri
        console.log("--- Finansal veriler temizleniyor ---");
        await prisma.tokenReplenishLog.deleteMany({});
        await prisma.autoReplenishConfig.deleteMany({});
        await prisma.tokenTransaction.deleteMany({});
        await prisma.transaction.deleteMany({});
        await prisma.enterpriseCreditLine.deleteMany({});
        await prisma.creditLineTransaction.deleteMany({});

        // 5. Güvenlik, Risk ve Loglar
        console.log("--- Güvenlik ve Log verileri temizleniyor ---");
        await prisma.performanceTier.deleteMany({});
        await prisma.riskEvent.deleteMany({});
        await prisma.riskScore.deleteMany({});
        await prisma.fraudReviewTicket.deleteMany({});
        await prisma.deviceFingerprint.deleteMany({});
        await prisma.velocityCounter.deleteMany({});
        await prisma.cancellationRecord.deleteMany({});
        await prisma.sLAMetric.deleteMany({});
        await prisma.dynamicPriceEvent.deleteMany({});
        await prisma.testLog.deleteMany({});
        await prisma.identityApplication.deleteMany({});
        await prisma.review.deleteMany({});

        // 6. Profiller ve Kullanıcılar (KRİTİK ADIM)
        console.log("--- Profiller temizleniyor ---");
        await prisma.guideProfile.deleteMany({});

        console.log("--- Admin dışındaki kullanıcılar temizleniyor ---");
        const deleteUsersResult = await prisma.user.deleteMany({
            where: {
                role: {
                    not: "ADMIN"
                }
            }
        });

        console.log(`\n✅ Başarıyla silinen kullanıcı sayısı: ${deleteUsersResult.count}`);
        console.log("✅ Tüm operasyonel tablolar sıfırlandı.");
        console.log("✅ Admin hesapları korundu.");

    } catch (error) {
        console.error("❌ Reset işlemi sırasında hata oluştu:", error);
    } finally {
        await prisma.$disconnect();
    }
}

nuclearReset();
