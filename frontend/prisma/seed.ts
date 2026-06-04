import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Token Packages...');

  // 1. Token Packages
  const tokenPackages = [
    { packageId: 'small', tokens: 10, priceTRY: 49.00, unitPrice: 4.90, isActive: true },
    { packageId: 'medium', tokens: 30, priceTRY: 119.00, unitPrice: 3.97, isActive: true },
    { packageId: 'large', tokens: 75, priceTRY: 249.00, unitPrice: 3.32, isActive: true },
    { packageId: 'mega', tokens: 200, priceTRY: 549.00, unitPrice: 2.75, isActive: true },
    { packageId: 'enterprise', tokens: 500, priceTRY: 999.00, unitPrice: 2.00, isActive: true },
  ];

  for (const pkg of tokenPackages) {
    await prisma.$executeRaw`
      INSERT INTO token_package_configs (id, packageId, tokens, priceTRY, unitPrice, isActive, updatedAt)
      VALUES (UUID(), ${pkg.packageId}, ${pkg.tokens}, ${pkg.priceTRY}, ${pkg.unitPrice}, ${pkg.isActive}, NOW())
      ON DUPLICATE KEY UPDATE
        tokens = ${pkg.tokens}, priceTRY = ${pkg.priceTRY}, unitPrice = ${pkg.unitPrice}, isActive = ${pkg.isActive}, updatedAt = NOW()
    `;
  }
  console.log('Token Packages seeded successfully.');

  // 2. Package Tier Configs
  const packageTiers = [
    { tierName: 'FREEMIUM', priceTRY: 0, offerCost: 5, hasBlogFeature: false, hasPosterGenerator: true, posterHasWatermark: true, dailyListingLimit: 5 },
    { tierName: 'PREMIUM', priceTRY: 299, offerCost: 3, hasBlogFeature: true, hasPosterGenerator: true, posterHasWatermark: false, dailyListingLimit: 50 },
    { tierName: 'PRO', priceTRY: 599, offerCost: 2, hasBlogFeature: true, hasPosterGenerator: true, posterHasWatermark: false, dailyListingLimit: 200 },
    { tierName: 'BUSINESS', priceTRY: 1499, offerCost: 1, hasBlogFeature: true, hasPosterGenerator: true, posterHasWatermark: false, dailyListingLimit: 1000 },
  ];

  for (const pkg of packageTiers) {
    await prisma.$executeRaw`
      INSERT INTO package_tier_configs (id, tierName, priceTRY, offerCost, hasBlogFeature, hasPosterGenerator, posterHasWatermark, dailyListingLimit, updatedAt)
      VALUES (UUID(), ${pkg.tierName}, ${pkg.priceTRY}, ${pkg.offerCost}, ${pkg.hasBlogFeature}, ${pkg.hasPosterGenerator}, ${pkg.posterHasWatermark}, ${pkg.dailyListingLimit}, NOW())
      ON DUPLICATE KEY UPDATE
        priceTRY = ${pkg.priceTRY}, offerCost = ${pkg.offerCost}, hasBlogFeature = ${pkg.hasBlogFeature}, hasPosterGenerator = ${pkg.hasPosterGenerator}, posterHasWatermark = ${pkg.posterHasWatermark}, dailyListingLimit = ${pkg.dailyListingLimit}, updatedAt = NOW()
    `;
  }
  console.log('Package Tiers seeded successfully.');

  // 3. Test Data (Chatbot, Newsletter, Users, etc)
  try {
    // Sohbet Robotu
    await prisma.$executeRaw`
      INSERT IGNORE INTO chatbot_templates (id, question, answer, isActive, \`order\`, createdAt, updatedAt) 
      VALUES 
      (UUID(), 'Umre turları fiyatları ne kadar?', 'Umre tur fiyatları seçeceğiniz paketlere ve tarihlere göre değişiklik göstermektedir.', true, 1, NOW(), NOW()),
      (UUID(), 'Nasıl rehber olabilirim?', 'Sistemimize kayıt olduktan sonra profilinizi tamamlayıp admin onayına gönderebilirsiniz.', true, 2, NOW(), NOW())
    `;

    // Bülten
    await prisma.$executeRaw`
      INSERT IGNORE INTO newsletter_subscribers (id, email, isActive, createdAt) 
      VALUES 
      (UUID(), 'testabone1@umrebuldum.com', true, NOW()),
      (UUID(), 'testabone2@umrebuldum.com', true, NOW())
    `;

    // Örnek Admin ve Rehber Kullanıcı (Eğer yoksa)
    const adminId = "clk123admin00000000000000";
    await prisma.$executeRaw`
      INSERT IGNORE INTO users (id, name, email, role, isApproved, isVerified, packageType, trustScore, availableBalance, createdAt, updatedAt) 
      VALUES (${adminId}, 'Super Admin', 'admin@umrebuldum.com', 'ADMIN', true, true, 'BUSINESS', 100, 10000, NOW(), NOW())
    `;

    const guideId = "clk123guide00000000000000";
    await prisma.$executeRaw`
      INSERT IGNORE INTO users (id, name, email, role, isApproved, isVerified, packageType, trustScore, availableBalance, createdAt, updatedAt) 
      VALUES (${guideId}, 'Örnek Rehber', 'rehber@umrebuldum.com', 'GUIDE', false, true, 'FREEMIUM', 85, 50, NOW(), NOW())
    `;

    // Rehber Profili
    await prisma.$executeRaw`
      INSERT IGNORE INTO guide_profiles (id, userId, quotaTarget, currentCount, averageRating, reviewCount, createdAt, updatedAt)
      VALUES (UUID(), ${guideId}, 100, 0, 0.00, 0, NOW(), NOW())
    `;

    // Bekleyen Örnek İlan
    await prisma.$executeRaw`
      INSERT IGNORE INTO guide_listings (id, guideId, title, description, city, extraServices, pricingDouble, pricingCurrency, quota, startDate, endDate, approvalStatus, createdAt, updatedAt)
      VALUES (UUID(), ${guideId}, 'Ramazan Umresi (Test)', 'Test ilan açıklamasıdır.', 'Mekke', '[]', 1500.00, 'SAR', 20, DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'PENDING', NOW(), NOW())
    `;

    console.log('Kapsamlı Test Mock Data başarıyla eklendi.');
  } catch (e) {
    console.log('Bazı test verileri atlandı (zaten mevcut olabilir veya şema uyumsuzluğu):', e);
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
