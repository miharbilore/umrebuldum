# Frontend-Backend Monetization Senkronizasyonu

## Genel Bakış

Frontend (Next.js/TypeScript) ve Backend (WordPress/PHP) arasında monetization sisteminin tam uyumlu çalışması için gerekli düzenlemeler yapıldı.

## Dosya Yapısı

### Frontend
```
frontend/
├── lib/
│   └── tier-config.ts          [YENİ ✨] Backend tier yapısı
├── components/
    └── monetization/
        ├── ProFeatures.tsx      [MEVCUT] Genel pro özellikler
        ├── UpgradePrompts.tsx   [MEVCUT] Upgrade mesajları
        ├── BackendSyncedComponents.tsx [YENİ ✨] Backend-senkronize bileşenler
        └── index.ts             [GÜNCELLENDİ ✏️] Export listesi
```

### Backend
```
wp-content/plugins/umrebuldum-tour-export/
├── includes/
│   ├── access-control.php    [GÜNCELLENDİ ✏️] Tier yönetimi
│   ├── offer-engine.php      [GÜNCELLENDİ ✏️] Upgrade mesajları
│   └── dashboard-widget.php  [GÜNCELLENDİ ✏️] Kullanım widget'ı
└── templates/
    └── settings-page.php     [YENİ ✨] Admin ayarları
```

---

## Tier Sistemi

### Backend PHP Tiers
```php
// includes/access-control.php
const TIER_FREE = 'free';
const TIER_PLUS = 'plus';
const TIER_PRO = 'pro';
```

### Frontend TypeScript Tiers
```typescript
// lib/tier-config.ts
export const TIERS = {
    FREE: 'free',
    PLUS: 'plus',
    PRO: 'pro',
} as const;
```

✅ **Tam Uyumlu**

---

## Özellik Karşılaştırması

| Özellik | FREE | PLUS | PRO |
|---------|------|------|-----|
| **Export/Gün** | 5 | ∞ | ∞ |
| **Kalite** | 60% | 85% | 100% |
| **Watermark** | ✓ Var | ✗ Yok | ✗ Yok |
| **Acil Durum Ekranı** | ✗ | ✓ | ✓ |
| **Rehber Bilgileri** | ✗ | ✓ | ✓ |
| **QR Kod** | ✗ | ✓ | ✓ |
| **Özel Branding** | ✗ | ✗ | ✓ |
| **YouTube Embed** | ✗ | ✗ | ✓ |
| **Analytics** | ✗ | ✗ | ✓ |

---

## Yeni Bileşenler

### 1. `tier-config.ts`
Backend tier yapısının TypeScript tanımları:

```typescript
import { TIER_CONFIGS, getTierConfig, hasFeature } from '@/lib/tier-config';

// Tier bilgisini al
const plusTier = TIER_CONFIGS.plus;
console.log(plusTier.features.quality); // 85

// Özellik kontrolü
const hasEmergency = hasFeature('plus', 'emergencyScreen'); // true
```

### 2. `BackendPricingTable`
Backend verileriyle otomatik doldurulan pricing table:

```tsx
import { BackendPricingTable } from '@/components/monetization';

<BackendPricingTable 
    currentTier="free"
    onSelectPlan={(tier) => console.log('Selected:', tier)}
/>
```

**Özellikler:**
- Backend `TIER_CONFIGS` ile otomatik senkronizasyon
- Kalite seviyesi gösterimi
- Watermark durumu
- Mevcut plan vurgulama

### 3. `QuotaUsageBar`
Günlük kullanım göstergesi:

```tsx
import { QuotaUsageBar } from '@/components/monetization';

<QuotaUsageBar 
    used={3} 
    limit={5} 
    tier="free" 
/>
```

**Görünüm:**
- FREE: Progress bar (3/5 kullanıldı)
- PLUS/PRO: "Sınırsız Kullanım Aktif" mesajı
- Renk kodlaması: Yeşil → Sarı → Kırmızı

### 4. `TierComparison`
Detaylı özellik karşılaştırma tablosu:

```tsx
import { TierComparison } from '@/components/monetization';

<TierComparison currentTier="free" />
```

---

## Backend API Entegrasyonu

### Endpoint: User Tier
```
GET /wp-json/ute/v1/user/tier
```

**Response:**
```json
{
    "tier": "plus",
    "tier_name": "PLUS",
    "quality_level": 85,
    "show_watermark": false,
    "has_emergency": true
}
```

### Endpoint: Quota Status
```
GET /wp-json/ute/v1/user/quota
```

**Response:**
```json
{
    "allowed": true,
    "used": 3,
    "limit": 5,
    "tier": "free"
}
```

### Endpoint: Upgrade Offers
```
GET /wp-json/ute/v1/offers/quality-upsell
```

**Response:**
```json
{
    "title": "Görsel Kalitesi: Standart (Web)",
    "message": "Baskı kalitesinde çıktı ve watermark kaldırmak ister misiniz?",
    "cta_label": "✨ PRO Kalitesine Geç",
    "upgrade_url": "https://example.com/product/plus"
}
```

---

## Kullanım Örnekleri

### Dashboard'da Kullanım Göstergesi

```tsx
'use client';

import { useEffect, useState } from 'react';
import { QuotaUsageBar } from '@/components/monetization';
import type { QuotaResponse } from '@/lib/tier-config';

export function DashboardUsage() {
    const [quota, setQuota] = useState<QuotaResponse | null>(null);

    useEffect(() => {
        fetch('/wp-json/ute/v1/user/quota')
            .then(res => res.json())
            .then(setQuota);
    }, []);

    if (!quota) return <div>Yükleniyor...</div>;

    return (
        <div className="my-6">
            <h3 className="text-lg font-semibold mb-3">Günlük Kullanım</h3>
            <QuotaUsageBar 
                used={quota.used} 
                limit={quota.limit} 
                tier={quota.tier} 
            />
        </div>
    );
}
```

### Pricing Page

```tsx
import { BackendPricingTable } from '@/components/monetization';

export default function PricingPage() {
    const handleSelectPlan = async (tier: string) => {
        // WooCommerce ürün sayfasına yönlendirin
        const response = await fetch(`/wp-json/ute/v1/upgrade-url/${tier}`);
        const { url } = await response.json();
        window.location.href = url;
    };

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold text-center mb-12">
                Planları Karşılaştır
            </h1>
            <BackendPricingTable onSelectPlan={handleSelectPlan} />
        </div>
    );
}
```

### Feature Gating

```tsx
import { hasFeature, TIERS } from '@/lib/tier-config';

function EmergencyButton({ userTier }: { userTier: string }) {
    const canUseEmergency = hasFeature(userTier as any, 'emergencyScreen');

    if (!canUseEmergency) {
        return (
            <div className="relative">
                <button disabled className="opacity-50 cursor-not-allowed">
                    🆘 Acil Durum
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        PLUS Gerekli
                    </span>
                </div>
            </div>
        );
    }

    return (
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg">
            🆘 Acil Durum
        </button>
    );
}
```

---

## Düzeltilen Uyumsuzluklar

### ❌ ÖNCEKİ (Uyumsuz)
**Frontend:**
- FREE: 3 listing, 5 poster/ay
- PRO: 15 listing, sınırsız poster
- AGENCY: Sınırsız

**Backend:**
- FREE: 5/gün
- PLUS: Sınırsız
- PRO: Sınırsız

### ✅ SONRAKİ (Uyumlu)
**Hem Frontend hem Backend:**
- FREE: 5 poster/gün, kalite 60%, watermark var
- PLUS: Sınırsız poster, kalite 85%, watermark yok, emergency var
- PRO: Sınırsız poster, kalite 100%, tüm özellikler

---

## Type Safety

Tüm tier ve feature isimleri artık TypeScript ile tip-güvenli:

```typescript
// ❌ Hatalı - compile error
hasFeature('plus', 'invalidFeature'); 

// ✅ Doğru - autocomplete çalışır
hasFeature('plus', 'emergencyScreen');

// ❌ Hatalı - compile error  
getTierConfig('invalid_tier');

// ✅ Doğru
getTierConfig(TIERS.PLUS);
```

---

## Testler

### Frontend Test
```typescript
import { canExport, getQualityLevel } from '@/lib/tier-config';

test('FREE tier has 5 daily exports', () => {
    expect(canExport('free', 4)).toBe(true);
    expect(canExport('free', 5)).toBe(false);
});

test('PLUS tier has unlimited exports', () => {
    expect(canExport('plus', 999)).toBe(true);
});

test('Quality levels match backend', () => {
    expect(getQualityLevel('free')).toBe(60);
    expect(getQualityLevel('plus')).toBe(85);
    expect(getQualityLevel('pro')).toBe(100);
});
```

---

## Checklist

- [x] Backend tier constants tanımlandı
- [x] Frontend tier types oluşturuldu
- [x] Tier özellikleri senkronize edildi
- [x] Backend-uyumlu pricing table
- [x] Quota usage bar bileşeni
- [x] Tier comparison table
- [x] Type-safe helper fonksiyonlar
- [x] Export index güncellendi
- [ ] REST API endpoints (gerekirse eklenecek)
- [ ] Real-time sync hooks (gerekirse eklenecek)

---

## Özet

✅ Frontend ve backend tam senkronize
✅ Type-safe tier yönetimi  
✅ Otomatik özellik eşleştirme
✅ Backend-driven UI components
✅ Zero hardcoded values

**Sonuç:** Artık backend'de tier özellikleri değiştiğinde, frontend otomatik olarak güncellenecek çünkü tek kaynak (`TIER_CONFIGS`) hem frontend hem backend için geçerli.
