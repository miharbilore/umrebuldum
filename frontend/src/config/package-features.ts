/**
 * Merkezi Paket Feature Flags Konfigürasyonu
 * 
 * Bu dosya tüm paket seviyelerine ait özellikleri ve hakları merkezi olarak tanımlar.
 * Herhangi bir package tier'ına yeni feature eklemek için bu dosyayı güncelle.
 * 
 * Avantajlar:
 * - User modeline hardcoded boolean alanları eklemeye gerek yok
 * - Yeni package eklemek veya feature değiştirmek kolay
 * - Token Rule Engine'ı bu config'i okumak için optimize edebiliriz
 */

import { PackageTier } from "@/../prisma/generated-client";

/**
 * Paket Seviyeleri ve Özellik Haritası
 */
export const PACKAGE_FEATURES: Record<PackageTier, PackageFeatureSet> = {
  FREEMIUM: {
    tier: "FREEMIUM",
    name: "Freemium",
    displayName: "Ücretsiz Plan",
    description: "Ücretsiz başlangıç paketi",
    
    // ✅ Finansal Kurallar
    allowAlacartPurchase: false,
    initialTokens: 15,
    monthlyRenewalTokens: 0,
    tokenSoftCap: 100,
    
    // ✅ İş Kuralı: Dependency Lock (Teklif için aktif ilan gerekli)
    requireActiveListingForOffer: true,
    
    // ✅ Günlük İşlem Sınırları
    dailyOfferLimit: 5,
    dailyListingLimit: 3,
    dailyBoostLimit: 0,
    dailySpotlightLimit: 0,
    
    // ✅ Özellik Erişimi
    features: {
      posterGenerator: true,      // Basit poster (watermark'lı)
      blogWriting: false,         // Blog yazma özelliği yok
      boostAccess: false,         // Boost kullanamaz
      spotlightAccess: false,     // Spotlight kullanamaz
      advancedAnalytics: false,
      customBranding: false,
    },
    
    // ✅ Görünüm Ayarları
    posterWatermark: true,        // Freemium: watermark'lı poster
    customDomain: false,
  },
  
  PREMIUM: {
    tier: "PREMIUM",
    name: "Premium",
    displayName: "Premium Plan",
    description: "Profesyonel rehber paketi",
    
    // ✅ Finansal Kurallar
    allowAlacartPurchase: true,   // Premium'dan sonrası token satın alabilir
    initialTokens: 50,
    monthlyRenewalTokens: 25,
    tokenSoftCap: 500,
    
    // ✅ İş Kuralı: Dependency Lock (Teklif için aktif ilan gerekli)
    requireActiveListingForOffer: true,
    
    // ✅ Günlük İşlem Sınırları
    dailyOfferLimit: 30,
    dailyListingLimit: 10,
    dailyBoostLimit: 10,
    dailySpotlightLimit: 0,
    
    // ✅ Özellik Erişimi
    features: {
      posterGenerator: true,
      blogWriting: false,         // Blog yok (PRO'da var)
      boostAccess: true,
      spotlightAccess: false,
      advancedAnalytics: true,
      customBranding: false,
    },
    
    // ✅ Görünüm Ayarları
    posterWatermark: false,       // Premium: watermark yok
    customDomain: false,
  },
  
  PRO: {
    tier: "PRO",
    name: "Pro",
    displayName: "Pro Plan",
    description: "İleri özellikli rehber paketi",
    
    // ✅ Finansal Kurallar
    allowAlacartPurchase: true,
    initialTokens: 100,
    monthlyRenewalTokens: 50,
    tokenSoftCap: 1000,
    
    // ✅ İş Kuralı: Dependency Lock
    requireActiveListingForOffer: true,
    
    // ✅ Günlük İşlem Sınırları
    dailyOfferLimit: 50,
    dailyListingLimit: 20,
    dailyBoostLimit: 20,
    dailySpotlightLimit: 5,
    
    // ✅ Özellik Erişimi
    features: {
      posterGenerator: true,
      blogWriting: true,          // Blog yazma (PRO'da var!)
      boostAccess: true,
      spotlightAccess: true,
      advancedAnalytics: true,
      customBranding: false,
    },
    
    // ✅ Görünüm Ayarları
    posterWatermark: false,
    customDomain: false,
  },
  
  BUSINESS: {
    tier: "BUSINESS",
    name: "Business",
    displayName: "Business Plan",
    description: "Kurumsal paket - maksimum özellikler",
    
    // ✅ Finansal Kurallar
    allowAlacartPurchase: true,
    initialTokens: 200,
    monthlyRenewalTokens: 100,
    tokenSoftCap: 2000,
    
    // ✅ İş Kuralı: Dependency Lock
    requireActiveListingForOffer: true,
    
    // ✅ Günlük İşlem Sınırları
    dailyOfferLimit: 100,
    dailyListingLimit: 50,
    dailyBoostLimit: 50,
    dailySpotlightLimit: 20,
    
    // ✅ Özellik Erişimi
    features: {
      posterGenerator: true,
      blogWriting: true,
      boostAccess: true,
      spotlightAccess: true,
      advancedAnalytics: true,
      customBranding: true,       // Business: kendi markası
    },
    
    // ✅ Görünüm Ayarları
    posterWatermark: false,
    customDomain: true,           // Business: custom domain
  },
};

/**
 * Package Feature Set Type Definition
 */
export interface PackageFeatureSet {
  tier: PackageTier;
  name: string;
  displayName: string;
  description: string;
  
  // Finansal
  allowAlacartPurchase: boolean;
  initialTokens: number;
  monthlyRenewalTokens: number;
  tokenSoftCap: number;
  
  // İş Kuralları
  requireActiveListingForOffer: boolean;
  
  // İşlem Limitleri
  dailyOfferLimit: number;
  dailyListingLimit: number;
  dailyBoostLimit: number;
  dailySpotlightLimit: number;
  
  // Özellik Flağları
  features: {
    posterGenerator: boolean;
    blogWriting: boolean;
    boostAccess: boolean;
    spotlightAccess: boolean;
    advancedAnalytics: boolean;
    customBranding: boolean;
  };
  
  // UI/UX Ayarları
  posterWatermark: boolean;
  customDomain: boolean;
}

/**
 * Belirli bir package tier'ının features'ını al
 * @param tier - PackageTier (FREEMIUM, PREMIUM, PRO, BUSINESS)
 * @returns PackageFeatureSet
 */
export function getPackageFeatures(tier: PackageTier): PackageFeatureSet {
  return PACKAGE_FEATURES[tier];
}

/**
 * Kullanıcı alâkart token satın alabilir mi?
 * @param tier - PackageTier
 * @returns boolean
 */
export function canPurchaseAlacart(tier: PackageTier): boolean {
  return PACKAGE_FEATURES[tier].allowAlacartPurchase;
}

/**
 * Belirli bir feature'a erişim izni var mı?
 * @param tier - PackageTier
 * @param feature - Feature adı
 * @returns boolean
 */
export function hasFeatureAccess(tier: PackageTier, feature: keyof PackageFeatureSet['features']): boolean {
  return PACKAGE_FEATURES[tier].features[feature];
}

/**
 * Günlük işlem limitini al
 * @param tier - PackageTier
 * @param actionType - 'offer' | 'listing' | 'boost' | 'spotlight'
 * @returns number (günlük limit)
 */
export function getDailyLimit(tier: PackageTier, actionType: 'offer' | 'listing' | 'boost' | 'spotlight'): number {
  const features = PACKAGE_FEATURES[tier];
  
  switch (actionType) {
    case 'offer':
      return features.dailyOfferLimit;
    case 'listing':
      return features.dailyListingLimit;
    case 'boost':
      return features.dailyBoostLimit;
    case 'spotlight':
      return features.dailySpotlightLimit;
    default:
      return 0;
  }
}

/**
 * İlk token grant'ını al (onboarding sırasında)
 * @param tier - PackageTier
 * @returns number (başlangıç token sayısı)
 */
export function getInitialTokenGrant(tier: PackageTier): number {
  return PACKAGE_FEATURES[tier].initialTokens;
}

/**
 * Aylık token yenileme miktarını al
 * @param tier - PackageTier
 * @returns number (aylık yenileme token sayısı)
 */
export function getMonthlyRenewalTokens(tier: PackageTier): number {
  return PACKAGE_FEATURES[tier].monthlyRenewalTokens;
}

/**
 * Token soft cap'ini al (maksimum birikebilir token)
 * @param tier - PackageTier
 * @returns number (token soft cap)
 */
export function getTokenSoftCap(tier: PackageTier): number {
  return PACKAGE_FEATURES[tier].tokenSoftCap;
}

/**
 * Dependency lock kuralı var mı? (Teklif için aktif ilan gerekli)
 * @param tier - PackageTier
 * @returns boolean
 */
export function requiresActiveListingForOffer(tier: PackageTier): boolean {
  return PACKAGE_FEATURES[tier].requireActiveListingForOffer;
}

/**
 * Tüm ücretli paket tier'larını al
 * @returns PackageTier[]
 */
export function getPaidTiers(): PackageTier[] {
  return ['PREMIUM', 'PRO', 'BUSINESS'];
}

/**
 * Paket tier'ının ücretli olup olmadığını kontrol et
 * @param tier - PackageTier
 * @returns boolean
 */
export function isPaidTier(tier: PackageTier): boolean {
  return getPaidTiers().includes(tier);
}
