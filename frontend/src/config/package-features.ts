// ─── Merkezi Paket Feature Flags (Veritabanı Destekli) ──────────────────
import { prisma } from "@/lib/prisma";
import type { PackageType } from "@/lib/db-types";
import { unstable_cache } from "next/cache";

export interface PackageFeatureFlags {
  allowAlacartPurchase: boolean;
  hasPosterGenerator: boolean;
  hasBlogFeature: boolean;
  offerCost: number;
  dailyOfferLimit: number;
  republishCost: number;
  demandUnlockCost: number;
  hasBoostAccess: boolean;
  hasSpotlightAccess: boolean;
  canApplyIdentityVerification: boolean;
  phoneVisibleOnListing: boolean;
  hasAIFeatures: boolean;
  posterHasWatermark: boolean;
  posterQuality: "LOW" | "NORMAL" | "HIGH";
  dailyListingLimit: number;
}

// Varsayılan Statik Fallbackler
export const DEFAULT_PACKAGE_FEATURES: Record<PackageType, PackageFeatureFlags> = {
  FREEMIUM: {
    allowAlacartPurchase: false,
    hasPosterGenerator: true,
    hasBlogFeature: false,
    offerCost: 5,
    dailyOfferLimit: 1,
    republishCost: 2,
    demandUnlockCost: 3,
    hasBoostAccess: false,
    hasSpotlightAccess: false,
    canApplyIdentityVerification: false,
    phoneVisibleOnListing: false,
    hasAIFeatures: false,
    posterHasWatermark: true,
    posterQuality: "LOW",
    dailyListingLimit: 5,
  },
  PREMIUM: {
    allowAlacartPurchase: true,
    hasPosterGenerator: true,
    hasBlogFeature: false,
    offerCost: 5,
    dailyOfferLimit: 5,
    republishCost: 2,
    demandUnlockCost: 3,
    hasBoostAccess: true,
    hasSpotlightAccess: false,
    canApplyIdentityVerification: true,
    phoneVisibleOnListing: true,
    hasAIFeatures: false,
    posterHasWatermark: true,
    posterQuality: "NORMAL",
    dailyListingLimit: 15,
  },
  PRO: {
    allowAlacartPurchase: true,
    hasPosterGenerator: true,
    hasBlogFeature: true,
    offerCost: 5,
    dailyOfferLimit: 20,
    republishCost: 2,
    demandUnlockCost: 3,
    hasBoostAccess: true,
    hasSpotlightAccess: true,
    canApplyIdentityVerification: true,
    phoneVisibleOnListing: true,
    hasAIFeatures: true,
    posterHasWatermark: false,
    posterQuality: "HIGH",
    dailyListingLimit: 50,
  },
  BUSINESS: {
    allowAlacartPurchase: true,
    hasPosterGenerator: true,
    hasBlogFeature: true,
    offerCost: 5,
    dailyOfferLimit: 50,
    republishCost: 2,
    demandUnlockCost: 3,
    hasBoostAccess: true,
    hasSpotlightAccess: true,
    canApplyIdentityVerification: true,
    phoneVisibleOnListing: true,
    hasAIFeatures: false,
    posterHasWatermark: false,
    posterQuality: "HIGH",
    dailyListingLimit: 100,
  },
};

export const getPackageFeatures = unstable_cache(
  async (tierSlug: string): Promise<PackageFeatureFlags> => {
    // Determine a fallback based on slug or default to FREEMIUM fallback
    let validTier: PackageType = "FREEMIUM";
    if (["FREEMIUM", "PREMIUM", "PRO", "BUSINESS"].includes(tierSlug)) {
      validTier = tierSlug as PackageType;
    }
    const fallback = DEFAULT_PACKAGE_FEATURES[validTier] ?? DEFAULT_PACKAGE_FEATURES.FREEMIUM;

    try {
      // Artık doğrudan CreditPackage (satış paketleri) tablosunu okuyoruz!
      const dbConfig = await prisma.creditPackage.findFirst({
        where: { slug: tierSlug }
      });

      if (dbConfig && dbConfig.features) {
        // Parse the JSON features field safely
        const f = typeof dbConfig.features === 'string' 
            ? JSON.parse(dbConfig.features) 
            : dbConfig.features as any;
        
        return {
          ...fallback,
          offerCost: f.offerCost !== undefined ? Number(f.offerCost) : fallback.offerCost,
          hasBlogFeature: f.hasBlogFeature ?? fallback.hasBlogFeature,
          hasPosterGenerator: f.hasPosterGenerator ?? fallback.hasPosterGenerator,
          posterHasWatermark: f.posterHasWatermark ?? fallback.posterHasWatermark,
          dailyListingLimit: f.dailyListingLimit !== undefined ? Number(f.dailyListingLimit) : fallback.dailyListingLimit,
          allowAlacartPurchase: f.allowAlacartPurchase ?? fallback.allowAlacartPurchase,
          dailyOfferLimit: f.dailyOfferLimit !== undefined ? Number(f.dailyOfferLimit) : fallback.dailyOfferLimit,
          republishCost: f.republishCost !== undefined ? Number(f.republishCost) : fallback.republishCost,
          demandUnlockCost: f.demandUnlockCost !== undefined ? Number(f.demandUnlockCost) : fallback.demandUnlockCost,
          hasBoostAccess: f.hasBoostAccess ?? fallback.hasBoostAccess,
          hasSpotlightAccess: f.hasSpotlightAccess ?? fallback.hasSpotlightAccess,
          canApplyIdentityVerification: f.canApplyIdentityVerification ?? fallback.canApplyIdentityVerification,
          phoneVisibleOnListing: f.phoneVisibleOnListing ?? fallback.phoneVisibleOnListing,
          hasAIFeatures: f.hasAIFeatures ?? fallback.hasAIFeatures,
          posterQuality: f.posterQuality ?? fallback.posterQuality,
        };
      }
      return fallback;
    } catch (error) {
      console.error("Package features fetch error:", error);
      return fallback;
    }
  },
  ["package-features-db"],
  {
    revalidate: 3600, // 1 saat önbellek, webhook veya admin on-save ile bozulacak
    tags: ["package-features"],
  }
);

export async function canPurchaseAlacart(tier: string): Promise<boolean> {
  const f = await getPackageFeatures(tier);
  return f.allowAlacartPurchase;
}

export async function canGeneratePoster(tier: string): Promise<boolean> {
  const f = await getPackageFeatures(tier);
  return f.hasPosterGenerator;
}

export async function canWriteBlog(tier: string): Promise<boolean> {
  const f = await getPackageFeatures(tier);
  return f.hasBlogFeature;
}

export async function getOfferCost(tier: string): Promise<number> {
  const f = await getPackageFeatures(tier);
  return f.offerCost;
}

export async function hasFeature(
  tier: string,
  feature: keyof PackageFeatureFlags
): Promise<boolean | number | string> {
  const f = await getPackageFeatures(tier);
  return f[feature];
}
