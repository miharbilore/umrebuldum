# Revised Prisma Schema Design: Multi-Tier Subscription System

## Prensip (Principle)
**Ölçeklenebilir Paket Mimarisi**: Paket özelliklerini ve yetkilerini `Package` modelde merkezi olarak tanımla. Kullanıcı tablosuna hardcoded boole alanları ekleme.

---

## 🔄 Veri Modeli İlişkileri (Data Model Relationships)

```
User (1) -------- (1) ActiveUserSubscription (current subscription)
                           |
                           ↓
                        Package (subscription template)
                           |
                           ├─→ Tier (FREEMIUM, PREMIUM_PRO, PREMIUM_BUSINESS, etc.)
                           ├─→ Features (JSON: poster, blog, alacart_tokens, etc.)
                           ├─→ Tokens & Limits (initial, monthly, daily caps)
                           └─→ Rights & Permissions (granular control)

User (1) -------- (M) UserSubscriptionHistory (audit trail)
                           |
                           ↓
                        Package
```

---

## 📋 Revize Edilmiş Prisma Şeması (Revised Prisma Schema)

### 1. PackageTier Enum - Paket Seviyeleri

```prisma
enum PackageTier {
  FREEMIUM              // Ücretsiz paket (15 token başlangıç)
  PREMIUM_PRO           // Ücretli: Pro seviye
  PREMIUM_BUSINESS      // Ücretli: Business seviye
  PREMIUM_ENTERPRISE    // Ücretli: Enterprise seviye
  LEGACY_PREMIUM        // Eski premium (migration için)
}
```

---

### 2. Package Model - Paket Tanımları (Scalable)

```prisma
model Package {
  id                    String          @id @default(cuid())
  
  // Temel Bilgiler
  name                  String          @unique        // "Premium Pro", "Premium Business"
  tier                  PackageTier     @unique        // Enum: FREEMIUM, PREMIUM_PRO, ...
  description           String?         @db.Text
  
  // Fiyatlandırma
  priceTRY              Decimal         @db.Decimal(10, 2)   // Aylık fiyat
  billingCycle          Int             @default(1)          // Ay cinsinden (1, 3, 12, vb.)
  
  // Token & Limit Konfigürasyonu
  initialTokens         Int             @default(15)         // Paket başlangıcında verilen token
  monthlyRenewalTokens  Int             @default(0)          // Aylık yenileme token (Freemium=0)
  maxTokenBalance       Int             @default(1000)       // Soft cap: maksimum birikebilir token
  dailyOfferCap         Int             @default(50)         // Günde max kaç offer gönderebilir
  dailyListingCap       Int             @default(10)         // Günde max kaç ilan açabilir
  dailyBoostCap         Int             @default(20)         // Günde max kaç boost kullanabilir
  
  // Özellik Erişim Kontrolleri (JSON Structure)
  features              Json            // Örnek: {
                                        //   "canBuyTokensAlacart": true,
                                        //   "posterGenerator": true,
                                        //   "blogWriting": true,
                                        //   "advancedAnalytics": false
                                        // }
  
  // İş Kuralları
  allowAlacartTokenPurchase  Boolean    @default(false)   // Freemium=false, ücretli=true
  requireActiveListingForOffer Boolean  @default(true)    // Dependency lock
  canAccessPremiumFeatures Boolean      @default(false)
  
  // Yönetim
  isActive              Boolean         @default(true)
  sortOrder             Int             @default(0)        // Admin UI sıraları
  roleTarget            UserRole        @default(GUIDE)    // Hangi role'a yönelik
  
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  
  // Relations
  userSubscriptions     ActiveUserSubscription[]
  subscriptionHistory   UserSubscriptionHistory[]
  
  @@unique([tier, roleTarget])
  @@index([isActive])
  @@index([tier])
  @@map("packages")
}
```

---

### 3. ActiveUserSubscription Model - Aktif Abonelik

```prisma
model ActiveUserSubscription {
  id                    String          @id @default(cuid())
  
  // User & Package
  userId                String          @unique        // Her user sadece 1 aktif subscription
  packageId             String
  
  // Abonelik Dönemi
  startDate             DateTime        @default(now())
  expiryDate            DateTime                        // Paket başlangıçta veya Stripe'tan hesaplanır
  renewalAttempts       Int             @default(0)    // Auto-renewal hatası tracking
  
  // Ödeme Bilgisi
  stripeSubscriptionId  String?         @unique        // Stripe subscription ID (Freemium=null)
  paymentMethod         String?         // "card", "bank_transfer", vb.
  
  // İz Bilgileri
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  
  // Relations
  user                  User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  package               Package         @relation(fields: [packageId], references: [id])
  
  @@index([userId])
  @@index([packageId])
  @@index([expiryDate])
  @@map("active_user_subscriptions")
}
```

---

### 4. UserSubscriptionHistory Model - Abonelik Geçmişi (Audit Trail)

```prisma
model UserSubscriptionHistory {
  id                    String          @id @default(cuid())
  
  // User & Package
  userId                String
  packageId             String
  
  // Geçiş Bilgileri
  previousPackageId     String?         // Upgrade/Downgrade tracking
  changeReason          String?         // "upgrade", "downgrade", "expired", "canceled"
  
  // Zaman
  startDate             DateTime        @default(now())
  endDate               DateTime?
  durationDays          Int?            // Kaç gün kullanıldı
  
  // İmport Bilgileri
  createdAt             DateTime        @default(now())
  
  // Relations
  user                  User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  package               Package         @relation(fields: [packageId], references: [id])
  
  @@index([userId, createdAt])
  @@index([packageId])
  @@map("user_subscription_history")
}
```

---

### 5. Revize Edilmiş User Model - Sadece İlgili Alanlar

```prisma
model User {
  id                     String                @id @default(cuid())
  
  // ... (mevcut alanlar)
  
  // ❌ REMOVED (artık kullanılmayacak):
  // - packageType            (replaced by activeSubscription.package.tier)
  // - packageExpiry          (replaced by activeSubscription.expiryDate)
  // - hasActivePaidPackage   (HARDCODED - kaldırıldı)
  // - canAccessPosterGenerator (HARDCODED - kaldırıldı)
  // - canAccessBlogFeature   (HARDCODED - kaldırıldı)
  
  // ✅ KEPT (Quiz & Profil tamamlama bonusu kontrolü):
  hasCompletedQuiz       Boolean               @default(false)
  quizAttempts           Int                   @default(0)
  lastQuizAttempt        DateTime?
  hasClaimedQuizBonus    Boolean               @default(false)    // 1 kez kontrol
  profileCompletedAt     DateTime?
  hasClaimedProfileBonus Boolean               @default(false)    // 1 kez kontrol
  quizPassed             Boolean               @default(false)    // Quiz geçti mi?
  
  // Relations
  activeSubscription     ActiveUserSubscription?
  subscriptionHistory    UserSubscriptionHistory[]
  
  // ... (mevcut relations)
}
```

---

## 🔧 İş Kuralı Implementasyonu (Business Logic Implementation)

### Kural 1: Alâkart Token Satın Alma (À la carte Token Purchase)
```typescript
// Logic in Application Layer:
async canPurchaseTokensAlacart(userId: string): Promise<boolean> {
  const subscription = await db.activeUserSubscription.findUnique({
    where: { userId },
    include: { package: true }
  });
  
  if (!subscription) return false;
  
  // Package configuration'dan kontrol et
  return subscription.package.allowAlacartTokenPurchase;
  // Freemium: false
  // PREMIUM_PRO: true
  // PREMIUM_BUSINESS: true
  // PREMIUM_ENTERPRISE: true
}
```

### Kural 2: Poster Generator Erişimi
```typescript
async canAccessPosterGenerator(userId: string): Promise<boolean> {
  const subscription = await db.activeUserSubscription.findUnique({
    where: { userId },
    include: { package: true }
  });
  
  if (!subscription) return false;
  
  // features JSON'dan kontrol et
  const features = subscription.package.features as { posterGenerator?: boolean };
  return features?.posterGenerator ?? false;
}
```

### Kural 3: Blog Yazma Yetki
```typescript
async canAccessBlogFeature(userId: string): Promise<boolean> {
  const subscription = await db.activeUserSubscription.findUnique({
    where: { userId },
    include: { package: true }
  });
  
  if (!subscription) return false;
  
  // features JSON'dan kontrol et
  const features = subscription.package.features as { blogWriting?: boolean };
  return features?.blogWriting ?? false;
}
```

### Kural 4: Dependency Lock (Teklif için aktif ilan)
```typescript
async canSendOffer(userId: string): Promise<boolean> {
  const subscription = await db.activeUserSubscription.findUnique({
    where: { userId },
    include: { package: true }
  });
  
  if (!subscription) return false;
  
  // Package'tan "requireActiveListingForOffer" kontrol et
  if (!subscription.package.requireActiveListingForOffer) {
    return true; // Bu paket için kural yok
  }
  
  // Dependency lock: aktif ilan var mı?
  const activeListings = await db.guideListing.count({
    where: {
      guideId: userId,
      active: true,
      deletedAt: null
    }
  });
  
  return activeListings > 0;
}
```

---

## 📦 Örnek Package Konfigürasyonları (Example Configurations)

### Freemium Paketi
```json
{
  "name": "Freemium",
  "tier": "FREEMIUM",
  "priceTRY": 0,
  "initialTokens": 15,
  "monthlyRenewalTokens": 0,
  "dailyOfferCap": 5,
  "allowAlacartTokenPurchase": false,
  "features": {
    "canBuyTokensAlacart": false,
    "posterGenerator": false,
    "blogWriting": false,
    "advancedAnalytics": false
  }
}
```

### Premium Pro Paketi
```json
{
  "name": "Premium Pro",
  "tier": "PREMIUM_PRO",
  "priceTRY": 299,
  "billingCycle": 1,
  "initialTokens": 50,
  "monthlyRenewalTokens": 25,
  "dailyOfferCap": 50,
  "maxTokenBalance": 500,
  "allowAlacartTokenPurchase": true,
  "features": {
    "canBuyTokensAlacart": true,
    "posterGenerator": true,
    "blogWriting": false,
    "advancedAnalytics": false
  }
}
```

### Premium Business Paketi
```json
{
  "name": "Premium Business",
  "tier": "PREMIUM_BUSINESS",
  "priceTRY": 799,
  "billingCycle": 1,
  "initialTokens": 100,
  "monthlyRenewalTokens": 50,
  "dailyOfferCap": 100,
  "maxTokenBalance": 1000,
  "allowAlacartTokenPurchase": true,
  "features": {
    "canBuyTokensAlacart": true,
    "posterGenerator": true,
    "blogWriting": true,
    "advancedAnalytics": true
  }
}
```

---

## 🎯 Migrasyon Yol Haritası (Migration Path)

1. **Yeni modeller oluştur** (Package, ActiveUserSubscription, UserSubscriptionHistory)
2. **Package seed data ekle** (Freemium, Premium tiers)
3. **Mevcut kullanıcıları migrate et**:
   - `packageType` → karşılık gelen `Package.tier`
   - `packageExpiry` → `ActiveUserSubscription.expiryDate`
4. **User.packageType alanını deprecate et** (migration sonrası kaldır)
5. **Application layer'ı güncelle** (Token Rule Engine uses new models)

---

## ✨ Avantajlar (Advantages)

| Avantaj | Açıklama |
|---------|----------|
| **Ölçeklenebilirlik** | Yeni paket tiers ekle → Database migration gerekli değil |
| **Esnek Özellik Yönetimi** | `features` JSON → kaç özellik olursa olsun ekle |
| **Denetim Yolu (Audit Trail)** | UserSubscriptionHistory → Paket geçiş logları |
| **Temiz İş Kuralları** | Logic Package config → hardcoded değil |
| **Multi-tier Desteği** | 3-4 farklı paket tier → kolay yönetilir |
| **Dinamik Limitleri** | dailyOfferCap, dailyListingCap → paket başına |

---

## 📝 İlişki Özeti (Relationship Summary)

```
User.activeSubscription (1:1) → ActiveUserSubscription
                                         ↓
                                      Package (tier + features + limits)
                                      
User.subscriptionHistory (1:M) → UserSubscriptionHistory (audit trail)
                                         ↓
                                      Package (historical reference)
```

**Paket Değişimi Süreci**:
1. User upgrade → yeni `ActiveUserSubscription` oluştur
2. Eski subscription → `UserSubscriptionHistory`'e taşı
3. Yeni paket features → immediately aktif

**Token Rule Engine Integration**:
- `TokenRuleEngine.canExecuteAction()` → `user.activeSubscription.package` kontrol et
- `allowAlacartTokenPurchase`, `features`, `dailyXxxCap` → Package'tan oku
- Hardcoded değer yok → tamamen konfigüre edilebilir

