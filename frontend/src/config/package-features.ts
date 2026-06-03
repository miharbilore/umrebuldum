// ─── Merkezi Paket Feature Flags (Code-Level) ──────────────────────────
// Veritabanına dokunmadan, PackageTier enum değerlerine göre
// paket yetkilerini merkezi olarak yönetir.
//
// Kullanım:
//   import { getPackageFeatures, canPurchaseAlacart } from "@/config/package-features";
//   const features = getPackageFeatures("PREMIUM");
//   if (features.allowAlacartPurchase) { ... }
// ────────────────────────────────────────────────────────────────────────

import type { PackageType } from "@/lib/db-types";

// ── Feature Flags Interface ─────────────────────────────────────────────

export interface PackageFeatureFlags {
  /** À la carte token satın alma yetkisi */
  allowAlacartPurchase: boolean;

  /** Poster oluşturucu erişimi */
  hasPosterGenerator: boolean;

  /** Blog / rehber makale yazma yetkisi */
  hasBlogFeature: boolean;

  /** Teklif gönderme token maliyeti */
  offerCost: number;

  /** Günlük teklif limiti */
  dailyOfferLimit: number;

  /** İlan yenileme (republish) token maliyeti */
  republishCost: number;

  /** Talep kilidini açma (demand unlock) token maliyeti */
  demandUnlockCost: number;

  /** Boost özelliğine erişim */
  hasBoostAccess: boolean;

  /** Spotlight özelliğine erişim */
  hasSpotlightAccess: boolean;

  /** Kimlik doğrulama başvuru hakkı */
  canApplyIdentityVerification: boolean;

  /** Telefon numarası ilan detayında görünür mü */
  phoneVisibleOnListing: boolean;

  /** AI destekli özellikler (gelecek) */
  hasAIFeatures: boolean;

  /** Filigranlı poster çıktısı */
  posterHasWatermark: boolean;

  /** Poster kalite seviyesi */
  posterQuality: "LOW" | "NORMAL" | "HIGH";
}

// ── Feature Flag Tanımları (Tier Bazlı) ─────────────────────────────────

export const PACKAGE_FEATURES: Record<PackageType, PackageFeatureFlags> = {
  // ── FREEMIUM ────────────────────────────────────────────────────────
  // Ücretsiz kullanıcılar: sınırlı erişim, à la carte yok
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
  },

  // ── PREMIUM ─────────────────────────────────────────────────────────
  // Temel ücretli paket: à la carte açılır, temel özellikler
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
  },

  // ── PRO ─────────────────────────────────────────────────────────────
  // Profesyonel rehberler: tüm özellikler açık
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
  },

  // ── BUSINESS ────────────────────────────────────────────────────────
  // Kurumsal / Acente: en yüksek limitler
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
  },
};

// ── Helper Fonksiyonlar ─────────────────────────────────────────────────

/**
 * Verilen PackageTier için feature flag'lerini döner.
 * Bilinmeyen tier verilirse FREEMIUM'a fallback yapar.
 */
export function getPackageFeatures(tier: string): PackageFeatureFlags {
  return PACKAGE_FEATURES[tier as PackageType] ?? PACKAGE_FEATURES.FREEMIUM;
}

/**
 * À la carte token satın alabilir mi?
 */
export function canPurchaseAlacart(tier: string): boolean {
  return getPackageFeatures(tier).allowAlacartPurchase;
}

/**
 * Poster oluşturabilir mi?
 */
export function canGeneratePoster(tier: string): boolean {
  return getPackageFeatures(tier).hasPosterGenerator;
}

/**
 * Blog yazabilir mi?
 */
export function canWriteBlog(tier: string): boolean {
  return getPackageFeatures(tier).hasBlogFeature;
}

/**
 * Teklif gönderme maliyetini döner.
 */
export function getOfferCost(tier: string): number {
  return getPackageFeatures(tier).offerCost;
}

/**
 * Belirli bir özelliğe erişim kontrolü (genel amaçlı).
 */
export function hasFeature(
  tier: string,
  feature: keyof PackageFeatureFlags
): boolean | number | string {
  return getPackageFeatures(tier)[feature];
}
