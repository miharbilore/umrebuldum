# 🕋 UmreBuldum — Hac & Umre Rehberlik Platformu

Umre ve hac yolcularını profesyonel rehberler, acenteler ve seyahat organizatörleri ile buluşturan **Türkiye'nin ilk modern umre pazar yeri (marketplace)** platformudur.

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Temel Özellikler](#-temel-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını-tech-stack)
- [Kurulum & Çalıştırma](#-kurulum--çalıştırma)
- [Ortam Değişkenleri (.env)](#-ortam-değişkenleri-env)
- [Veritabanı Yönetimi](#-veritabanı-yönetimi)
- [Canlıya Alma (Deploy)](#-canlıya-alma-deploy)
- [Bakım & Operasyon](#-bakım--operasyon)
- [Proje Mimarisi](#-proje-mimarisi)
- [İleride Yapılacaklar](#-i̇leride-yapılacaklar-roadmap)

---

## 🌟 Proje Hakkında

Bu platform üç ana kullanıcı grubuna hitap eder:

- **Umre Yolcuları (User):** Bütçelerine ve tarihlerine uygun umre turlarını arar, karşılaştırır, rehberlerle mesajlaşır ve yorum bırakır.
- **Rehberler & Acenteler (Guide / Organization):** Gelişmiş Dashboard ile ilan açar, sosyal medya afişi oluşturur, müşteri talepleri yönetir, güven rozeti (Mavi Tik) kazanır.
- **Yönetici (Admin):** Kapsamlı admin paneli ile kullanıcı onayı, belge doğrulama (KYC), token yönetimi, sistem analitiği ve içerik moderasyonu yapar.

---

## ✨ Temel Özellikler

### Kullanıcılar İçin
- 🔍 Gelişmiş ilan arama ve filtreleme (şehir, tarih, bütçe, oda tipi)
- 📝 Özel umre talebi oluşturma (rehberlerden teklif alma)
- 💬 Canlı mesajlaşma (Pusher WebSocket)
- ⭐ 4 boyutlu yorum ve puanlama sistemi
- 🤖 AI Chatbot ile sorularınıza anında cevap

### Rehber & Acenteler İçin
- 📊 Gelişmiş Dashboard (KPI takibi, görüntülenme, tıklanma)
- 🎨 22 şablonlu Sosyal Medya Afiş Oluşturucu (Poster Generator)
- 🔵 Mavi Tik (Güven Rozeti) ve %100 Güven Skoru sistemi
- 🎯 Akıllı Teklif ve Lead Matching sistemi
- 📈 Token bazlı ekonomi (ilan öne çıkarma, boost)
- 📰 Rehber Blog & SEO makaleleri

### Güvenlik & Altyapı
- 🔐 NextAuth v5 ile OAuth (Google, Apple, Facebook) + E-posta/Şifre
- 🛡️ Çift katlı token güvenliği (Idempotency Key + Serializable Transaction)
- 🚦 Rate Limiting & Brute-Force koruması (Upstash Redis)
- 📧 OTP doğrulama (Resend API ile e-posta)
- 🔥 Firebase SMS doğrulama
- 🧾 Çift yönlü muhasebe defteri (Double-Entry Ledger) ile token takibi

---

## 🛠 Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Framework** | Next.js (App Router) | 16.x |
| **UI Kütüphanesi** | React | 19.x |
| **Dil** | TypeScript | 5.x |
| **Stil** | Tailwind CSS | v4 |
| **Animasyonlar** | Framer Motion | - |
| **UI Bileşenleri** | shadcn/ui + Radix UI | - |
| **Veritabanı** | MySQL | 8.x |
| **ORM** | Prisma | 5.x |
| **Kimlik Doğrulama** | NextAuth.js (Auth.js) | v5 |
| **Gerçek Zamanlı** | Pusher (WebSocket) | - |
| **E-posta** | Resend API | - |
| **SMS** | Firebase Auth | - |
| **Rate Limiting** | Upstash Redis | - |
| **Ödeme** | Stripe, PayTR, Iyzico | - |
| **Dosya Yükleme** | AWS S3 | - |

---

## ⚙️ Kurulum & Çalıştırma

### Gereksinimler
- **Node.js** v18 veya üzeri
- **MySQL** sunucusu (XAMPP, WAMP veya Docker)
- **Git**

### Adımlar

```bash
# 1. Projeyi klonlayın
git clone https://github.com/miharbilore/umrebuldum.git
cd umrebuldum/frontend

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini ayarlayın
# .env.local dosyanızı oluşturun (aşağıdaki bölüme bakın)

# 4. Veritabanını hazırlayın
npx prisma generate        # Prisma Client'ı oluşturur
npx prisma db push         # Tablolarınızı MySQL'e yazar

# 5. Admin hesabı oluşturun (isteğe bağlı)
npx tsx scripts/seed-admin.ts

# 6. Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

---

## 🔐 Ortam Değişkenleri (.env)

`frontend/.env.local` dosyasında ayarlanması gereken değişkenler:

### Zorunlu (Temel Çalışma İçin)

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | MySQL bağlantı URL'i | `mysql://root:@localhost:3306/umrebuldum` |
| `AUTH_SECRET` | NextAuth güvenlik anahtarı (rastgele 64 karakterlik) | `openssl rand -hex 32` ile üretin |
| `NEXTAUTH_URL` | Projenizin ana URL'i | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | Host güvenliği | `true` |

### OAuth (Sosyal Giriş)

| Değişken | Açıklama |
|----------|----------|
| `AUTH_GOOGLE_ID` | Google Cloud Console'dan alınan Client ID |
| `AUTH_GOOGLE_SECRET` | Google Client Secret |
| `AUTH_APPLE_ID` | Apple Developer hesabından Service ID |
| `AUTH_FACEBOOK_ID` | Meta Developers uygulamanızın App ID |

### Servisler

| Değişken | Ne İşe Yarar | Nereden Alınır |
|----------|-------------|----------------|
| `RESEND_API_KEY` | E-posta gönderimi (OTP, bildirimler) | [resend.com](https://resend.com) |
| `PUSHER_APP_ID`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER` | Canlı sohbet (WebSocket) | [pusher.com](https://pusher.com) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting, bot koruması | [upstash.com](https://upstash.com) |
| `CRON_SECRET` | Zamanlanmış görevlerin güvenlik anahtarı | Kendiniz belirleyin |

### Firebase (SMS Doğrulama)

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase projesinden Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK JSON (sunucu tarafı) |

### Ödeme Sistemleri (İsteğe Bağlı)

| Değişken | Açıklama |
|----------|----------|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe entegrasyonu |
| `IYZICO_API_KEY`, `IYZICO_SECRET_KEY` | Iyzico entegrasyonu |
| `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` | PayTR entegrasyonu |

> **Not:** Ödeme anahtarları boş bırakılırsa sistem token satışı kısmını devre dışı bırakır, diğer tüm özellikler çalışır.

---

## 🗄️ Veritabanı Yönetimi

### Sık Kullanılan Prisma Komutları

```bash
# Şema değişikliğinden sonra veritabanını güncelle
npx prisma db push

# Prisma Client'ı yeniden oluştur
npx prisma generate

# Veritabanını tarayıcıda görüntüle (Prisma Studio)
npx prisma studio

# Veritabanını sıfırla (DİKKAT: Tüm veriler silinir!)
npx prisma db push --force-reset
```

### Faydalı Seed Scriptleri

```bash
npx tsx scripts/seed-admin.ts          # Admin hesabı oluştur
npx tsx scripts/setup-packages.ts      # Token paketlerini tanımla
npx tsx scripts/seed-articles.ts       # Örnek blog yazıları ekle
npx tsx scripts/seed-pseo.ts           # SEO sayfaları oluştur
npx tsx scripts/populate-slugs.ts      # URL slug'larını doldur
```

---

## 🚀 Canlıya Alma (Deploy)

### Seçenek 1: Vercel (Önerilen)

1. GitHub deponuzu Vercel'e bağlayın (vercel.com → "Add New Project")
2. Framework Preset otomatik olarak **Next.js** seçilecektir
3. **Root Directory** olarak `frontend` yazın
4. **Environment Variables** kısmına `.env.local` içeriğini ekleyin
5. `DATABASE_URL` olarak uzak bir MySQL sunucusu kullanın (PlanetScale, AWS RDS, Aiven vb.)
6. "Deploy" butonuna basın

### Seçenek 2: VPS / Sunucu (Ubuntu + PM2)

```bash
# Sunucunuza SSH ile bağlanın
cd /var/www/umrebuldum/frontend

# Bağımlılıkları yükleyin
npm install

# Prisma Client oluşturun
npx prisma generate

# Production build alın
npm run build

# PM2 ile başlatın
pm2 start npm --name "umrebuldum" -- start

# Nginx ile reverse proxy ayarlayın (3000 → 443)
```

### Deploy Sonrası Kontrol Listesi

- [ ] Veritabanı bağlantısı çalışıyor mu? (`npx prisma db push`)
- [ ] Admin hesabı oluşturuldu mu? (`npx tsx scripts/seed-admin.ts`)
- [ ] Token paketleri tanımlandı mı? (`npx tsx scripts/setup-packages.ts`)
- [ ] E-posta gönderimi çalışıyor mu? (Resend API Key doğru mu?)
- [ ] OAuth yönlendirme URL'leri güncellendi mi? (Google Console'da `NEXTAUTH_URL`)
- [ ] Cron job'lar ayarlandı mı? (aşağıya bakın)

---

## 🛠 Bakım & Operasyon

### Cron Job'lar (Zamanlanmış Görevler)

Sisteminizde (cPanel, Vercel Cron veya sunucu crontab) şu endpoint'leri tetikleyin:

| Endpoint | Sıklık | Ne Yapar |
|----------|--------|----------|
| `/api/cron/package-downgrades` | Günde 1x | Süresi dolan paketleri FREEMIUM'a düşürür |
| `/api/cron/package-downgrades` | Günde 1x | Token süreleri dolan kullanıcılara uyarı gönderir |

> Her cron isteğinde `Authorization: Bearer {CRON_SECRET}` header'ı eklenmeli.

### Veritabanı Yedeklemesi

```bash
# MySQL yedeği alma
mysqldump -u root umrebuldum > backup_$(date +%Y%m%d).sql

# Yedeği geri yükleme
mysql -u root umrebuldum < backup_20260617.sql
```

### Admin Paneli

`/admin` adresinden erişilebilir. Admin yetkilerine sahip kullanıcı gerektirir.

**Admin'in görevleri:**
- Rehber/acente kimlik doğrulaması (KYC) → Mavi Tik verme
- İlan onayı/reddi
- Kullanıcı yorum moderasyonu
- Token bakiye düzenlemeleri
- Sistem ayarları (bakım modu vb.)

---

## 🏗 Proje Mimarisi

```
umrebuldum/
├── README.md                    # ← Bu dosya
├── frontend/                    # Ana uygulama
│   ├── prisma/
│   │   └── schema.prisma        # Veritabanı şeması (tek kaynak)
│   ├── scripts/                 # Seed ve test scriptleri
│   ├── src/
│   │   ├── app/                 # Next.js sayfa ve API rotaları
│   │   │   ├── api/             # 32 backend API endpoint'i
│   │   │   ├── dashboard/       # Kullanıcı paneli sayfaları
│   │   │   ├── admin/           # Admin paneli sayfaları
│   │   │   └── ...              # Diğer sayfalar (login, tours, vb.)
│   │   ├── components/          # React UI bileşenleri
│   │   │   ├── ui/              # Temel bileşenler (shadcn/ui)
│   │   │   ├── dashboard/       # Dashboard bileşenleri
│   │   │   ├── admin/           # Admin bileşenleri
│   │   │   └── ...
│   │   ├── modules/             # İş mantığı modülleri (Clean Architecture)
│   │   │   ├── tokens/          # Token sistemi (domain → application → infra)
│   │   │   ├── reviews/         # Yorum sistemi
│   │   │   ├── fraud/           # Dolandırıcılık tespiti
│   │   │   └── analytics/       # Analitik
│   │   ├── lib/                 # Yardımcı kütüphaneler ve servisler
│   │   ├── core/                # Çekirdek altyapı (EventBus, Guards)
│   │   ├── jobs/                # Arka plan görevleri (Cron)
│   │   ├── hooks/               # React custom hooks
│   │   └── config/              # Uygulama konfigürasyonları
│   ├── docs/                    # Tasarım dokümanları
│   └── public/                  # Statik dosyalar (resimler, logolar)
└── .env                         # Kök dizin env (varsa)
```

### Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `prisma/schema.prisma` | Tüm veritabanı tabloları burada tanımlı |
| `src/lib/auth.ts` | Kimlik doğrulama yapılandırması |
| `src/lib/package-system.ts` | Paket limitleri ve token fiyatlandırması |
| `src/modules/tokens/` | Token ekonomisinin çekirdek mantığı |
| `src/proxy.ts` | Middleware (yetkilendirme, yönlendirme) |
| `next.config.mjs` | Next.js yapılandırması ve güvenlik header'ları |

---

## 🎯 İleride Yapılacaklar (Roadmap)

- [ ] 📱 **Mobil Uygulama (React Native)** — iOS ve Android marketlere yükleme
- [ ] 🤖 **Gelişmiş AI Chatbot** — Kullanıcı taleplerini anlayıp doğru rehberle eşleştirme
- [ ] 🌍 **Çoklu Dil (i18n)** — Arapça, İngilizce tam uyumluluk
- [ ] 💳 **Taksitli Ödeme** — Stripe/PayTR üzerinden doğrudan tur satışı
- [ ] 📊 **Gelişmiş Analitik Dashboard** — Rehberler için detaylı performans raporları
- [ ] 🔔 **Push Bildirimler** — Mobil ve masaüstü anlık bildirimler
- [ ] 🗺️ **Harita Entegrasyonu** — Tur güzergahı görselleştirme

---

## 📁 Ek Dokümanlar

| Dosya | İçerik |
|-------|--------|
| [docs/ORGANIZER_DASHBOARD_UX.md](frontend/docs/ORGANIZER_DASHBOARD_UX.md) | Organizatör Dashboard tasarım rehberi |
| [docs/PRO_MONETIZATION_UX.md](frontend/docs/PRO_MONETIZATION_UX.md) | Monetizasyon ve paket stratejisi |

---

*Bu proje modern güvenlik mimarisi (Idempotency, CSRF, Rate Limiting, Double-Entry Ledger) ile korunmaktadır.*
