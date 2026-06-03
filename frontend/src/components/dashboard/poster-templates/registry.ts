import { TierType } from "@/lib/tier-config";

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    requiredTier: "FREEMIUM" | "PREMIUM" | "PRO" | "BUSINESS";
    thumbnail: string;
    // We can also require specific features like 'watermark: false' or 'posterQuality: "HIGH"'
    minQuality: "LOW" | "NORMAL" | "HIGH";
}

export const POSTER_TEMPLATES: TemplateConfig[] = [
    // 1. KATEGORİ: CLASSIC & PREMIUM
    {
        id: "tpl-01-classic",
        name: "Klasik Umre",
        description: "Temiz ve güven veren başlangıç tasarımı.",
        requiredTier: "FREEMIUM",
        minQuality: "LOW",
        thumbnail: "/templates/tpl-01.jpg",
    },
    {
        id: "tpl-02-modern",
        name: "Altın Premium",
        description: "Zengin altın detaylı lüks görünüm.",
        requiredTier: "PREMIUM",
        minQuality: "LOW",
        thumbnail: "/templates/tpl-02.jpg",
    },
    {
        id: "tpl-03-elegant",
        name: "Zarif Kabe",
        description: "Karanlık tema ve modern tipografi.",
        requiredTier: "PREMIUM",
        minQuality: "NORMAL",
        thumbnail: "/templates/tpl-03.jpg",
    },
    {
        id: "tpl-04-premium",
        name: "Lüks VIP",
        description: "Yüksek kaliteli kurumsal VIP tasarım.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-04.jpg",
    },
    {
        id: "tpl-17-ultra",
        name: "Ultra Premium",
        description: "En yüksek kalite, karanlık mod ve altın detaylar.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-17.jpg",
    },
    {
        id: "tpl-18-gold",
        name: "Gold Premium Final",
        description: "Zenginlik ve huzur veren altın geçişleri.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-18.jpg",
    },

    // 2. KATEGORİ: MINIMAL CLEAN
    {
        id: "tpl-05-luxury",
        name: "Minimal Elit",
        description: "Apple tarzı sade ve şık tasarım.",
        requiredTier: "PREMIUM",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-05.jpg",
    },
    {
        id: "tpl-06-emerald",
        name: "Sade Odak",
        description: "Boşlukların gücünü kullanan ultra minimal tasarım.",
        requiredTier: "PREMIUM",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-06.jpg",
    },
    {
        id: "tpl-07-rose",
        name: "Modern Izgara",
        description: "Geometrik ve modern bir yerleşim.",
        requiredTier: "PREMIUM",
        minQuality: "NORMAL",
        thumbnail: "/templates/tpl-07.jpg",
    },
    {
        id: "tpl-19-minimal",
        name: "Minimal Clean Final",
        description: "Tipografi odaklı ultra temiz tasarım.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-19.jpg",
    },

    // 3. KATEGORİ: PHOTO HERO
    {
        id: "tpl-08-indigo",
        name: "Fotoğraf Odaklı",
        description: "Instagram için etkileyici tam ekran görsel.",
        requiredTier: "PREMIUM",
        minQuality: "NORMAL",
        thumbnail: "/templates/tpl-08.jpg",
    },
    {
        id: "tpl-09-vibrant",
        name: "Alt Panel",
        description: "Üstte büyük fotoğraf, altta bilgi kartı.",
        requiredTier: "PREMIUM",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-09.jpg",
    },
    {
        id: "tpl-10-darkmatic",
        name: "Sinematik",
        description: "Merkezi metin ve dramatik ışıklandırma.",
        requiredTier: "PREMIUM",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-10.jpg",
    },
    {
        id: "tpl-20-photo",
        name: "Photo Hero Final",
        description: "Görseli ve duyguyu en iyi yansıtan dev fotoğraf alanı.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-20.jpg",
    },

    // 4. KATEGORİ: CARD UI
    {
        id: "tpl-11-card",
        name: "Dashboard Kart",
        description: "Net bloklar ve hiyerarşik yerleşim.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-11.jpg",
    },
    {
        id: "tpl-12-softcard",
        name: "Yumuşak Kartlar",
        description: "Geniş boşluklar ve pastel tonlar.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-12.jpg",
    },
    {
        id: "tpl-13-pricecard",
        name: "Fiyat Vurgulu",
        description: "Fiyatları ön plana çıkaran modern kart yapısı.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-13.jpg",
    },
    {
        id: "tpl-21-card",
        name: "Card UI Final",
        description: "Dashboard estetiği ile net fiyat blokları.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-21.jpg",
    },

    // 5. KATEGORİ: GUIDE TRUST
    {
        id: "tpl-14-guide",
        name: "Rehber Odaklı",
        description: "Rehberin kimliğini ve güveni öne çıkaran tasarım.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-14.jpg",
    },
    {
        id: "tpl-15-guideside",
        name: "Rehber Yan Panel",
        description: "Solda fotoğraf, sağda detaylı tur bilgileri.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-15.jpg",
    },
    {
        id: "tpl-16-guidepremium",
        name: "Rehber Premium",
        description: "Maksimum güven ve lüks rehber sunumu.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-16.jpg",
    },
    {
        id: "tpl-22-guide",
        name: "Guide Trust Final",
        description: "Rehberinize duyulan güveni zirveye taşıyan tasarım.",
        requiredTier: "PRO",
        minQuality: "HIGH",
        thumbnail: "/templates/tpl-22.jpg",
    }
];
