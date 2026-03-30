import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Paket Tanımları ─────────────────────────────────────────────────────
// Her baz paket (slug) + 3 billing period (1, 3, 12 ay)

interface PkgDef {
  slug: string;
  name: string;
  credits: number;
  monthlyPrice: number;
  roleTarget: "GUIDE" | "ORGANIZATION";
  sortOrder: number;
  features: Record<string, any>;
}

const GUIDE_PACKAGES: PkgDef[] = [
  {
    slug: "FREEMIUM", name: "Freemium",
    credits: 15, monthlyPrice: 0,
    roleTarget: "GUIDE", sortOrder: 0,
    features: {
      maxListings: 1, listingDays: 30, maxBoosts: 0, boostDays: 0,
      phoneVisible: false, spotlightEligible: false, priorityRanking: false,
      trustBoost: false, identityVerificationEligible: true,
      canCreatePoster: false, watermark: true, posterQuality: "LOW"
    }
  },
  {
    slug: "PREMIUM", name: "Premium",
    credits: 50, monthlyPrice: 199,
    roleTarget: "GUIDE", sortOrder: 1,
    features: {
      maxListings: 3, listingDays: 60, maxBoosts: 1, boostDays: 3,
      phoneVisible: true, spotlightEligible: false, priorityRanking: false,
      trustBoost: false, identityVerificationEligible: true,
      canCreatePoster: true, watermark: true, posterQuality: "NORMAL"
    }
  },
  {
    slug: "PLUS", name: "Plus",
    credits: 100, monthlyPrice: 399,
    roleTarget: "GUIDE", sortOrder: 2,
    features: {
      maxListings: 5, listingDays: 90, maxBoosts: 3, boostDays: 5,
      phoneVisible: true, spotlightEligible: true, priorityRanking: true,
      trustBoost: false, identityVerificationEligible: true,
      canCreatePoster: true, watermark: false, posterQuality: "NORMAL"
    }
  },
  {
    slug: "PRO", name: "Pro",
    credits: 200, monthlyPrice: 699,
    roleTarget: "GUIDE", sortOrder: 3,
    features: {
      maxListings: 15, listingDays: 180, maxBoosts: 5, boostDays: 7,
      phoneVisible: true, spotlightEligible: true, priorityRanking: true,
      trustBoost: true, identityVerificationEligible: true,
      canCreatePoster: true, watermark: false, posterQuality: "HIGH"
    }
  },
];

const CORP_PACKAGES: PkgDef[] = [
  {
    slug: "FREEMIUM", name: "Kurumsal Freemium",
    credits: 15, monthlyPrice: 0,
    roleTarget: "ORGANIZATION", sortOrder: 10,
    features: {
      maxListings: 1, listingDays: 30, maxBoosts: 0, boostDays: 0,
      phoneVisible: false, spotlightEligible: false, priorityRanking: false,
      trustBoost: false, identityVerificationEligible: true,
      canCreatePoster: false, watermark: true, posterQuality: "LOW"
    }
  },
  {
    slug: "BUSINESS", name: "Kurumsal",
    credits: 500, monthlyPrice: 1299,
    roleTarget: "ORGANIZATION", sortOrder: 11,
    features: {
      maxListings: 30, listingDays: 180, maxBoosts: 10, boostDays: 7,
      phoneVisible: true, spotlightEligible: true, priorityRanking: true,
      trustBoost: true, identityVerificationEligible: true,
      canCreatePoster: true, watermark: false, posterQuality: "HIGH"
    }
  },
  {
    slug: "BUSINESS_PLUS", name: "Kurumsal Plus",
    credits: 1000, monthlyPrice: 2499,
    roleTarget: "ORGANIZATION", sortOrder: 12,
    features: {
      maxListings: 100, listingDays: 365, maxBoosts: 30, boostDays: 14,
      phoneVisible: true, spotlightEligible: true, priorityRanking: true,
      trustBoost: true, identityVerificationEligible: true,
      canCreatePoster: true, watermark: false, posterQuality: "HIGH"
    }
  },
];

const PERIODS = [
  { months: 1,  label: "Aylık",   discountPct: 0 },
  { months: 3,  label: "3 Aylık", discountPct: 7 },
  { months: 12, label: "Yıllık",  discountPct: 14 },
];

async function main() {
  console.log("Clearing old packages...");
  await prisma.creditPackage.deleteMany({});

  const allPkgs = [...GUIDE_PACKAGES, ...CORP_PACKAGES];

  for (const pkg of allPkgs) {
    // FREEMIUM is always free, only create 1-month period
    if (pkg.monthlyPrice === 0) {
      await prisma.creditPackage.create({
        data: {
          id: `${pkg.slug}_${pkg.roleTarget === "ORGANIZATION" ? "ORG" : "GUIDE"}_1`,
          slug: pkg.slug,
          name: pkg.name,
          credits: pkg.credits,
          priceTRY: 0,
          monthlyPrice: 0,
          billingPeriod: 1,
          roleTarget: pkg.roleTarget,
          sortOrder: pkg.sortOrder,
          features: pkg.features,
        },
      });
      console.log(`✓ ${pkg.name} (Ücretsiz)`);
      continue;
    }

    // Paid packages: create 3 billing period variants
    for (const period of PERIODS) {
      const totalMonths = period.months;
      const discountMultiplier = 1 - period.discountPct / 100;
      const totalPrice = Math.round(pkg.monthlyPrice * totalMonths * discountMultiplier);
      const creditsForPeriod = pkg.credits * totalMonths;

      const periodSuffix = totalMonths === 1 ? "" : `_${totalMonths}`;
      const roleSuffix = pkg.roleTarget === "ORGANIZATION" ? "_ORG" : "";
      const id = `${pkg.slug}${roleSuffix}${periodSuffix}`;

      await prisma.creditPackage.create({
        data: {
          id,
          slug: pkg.slug,
          name: `${pkg.name} — ${period.label}`,
          credits: creditsForPeriod,
          priceTRY: totalPrice,
          monthlyPrice: pkg.monthlyPrice,
          billingPeriod: totalMonths,
          roleTarget: pkg.roleTarget,
          sortOrder: pkg.sortOrder * 100 + totalMonths,
          features: pkg.features,
        },
      });
      console.log(`✓ ${pkg.name} — ${period.label} (${totalPrice}₺, ${creditsForPeriod} kredi)`);
    }
  }

  // Migrate existing FREE users to FREEMIUM
  console.log("\nMigrating FREE → FREEMIUM...");
  const freeUpdated = await prisma.user.updateMany({
    where: { packageType: "FREE" },
    data: { packageType: "FREEMIUM" },
  });
  console.log(`  ${freeUpdated.count} user(s) migrated.`);

  // Migrate VIP → PRO (grandfathered)
  const vipUpdated = await prisma.user.updateMany({
    where: { packageType: "VIP" },
    data: { packageType: "PRO" },
  });
  console.log(`  ${vipUpdated.count} VIP → PRO migrated.`);

  console.log("\n✅ Done! All packages seeded.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
