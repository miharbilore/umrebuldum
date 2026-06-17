# 🕋 UmreBuldum - Hac & Umre Rehberlik Platformu

UmreBuldum, umre ve hac yolcularını profesyonel rehberler, acenteler ve seyahat organizatörleri ile buluşturan modern bir pazar yeri (marketplace) platformudur. 

## 🌟 Proje Hakkında

Bu platform, kullanıcıların kendi bütçelerine, tarihlerine ve ihtiyaçlarına uygun umre rehberini veya turunu bulmasını sağlar. Aynı zamanda yetkili rehberlerin ve acentelerin kendi ilanlarını açmasına, müşterilerle canlı mesajlaşmasına ve özel afişler oluşturarak sosyal medyada pazarlama yapmasına olanak tanır.

### Temel Özellikler
- **Kullanıcılar İçin**: İlan arama, özel umre talebi oluşturma, rehberlere soru sorma, yorum ve puanlama sistemi.
- **Rehber/Acenteler İçin**: Gelişmiş Dashboard, ilan yönetimi, dinamik sosyal medya afişi oluşturucu (Poster Generator), güven skoru ve rozet (Mavi Tik) sistemi, canlı mesajlaşma.
- **Yönetim (Admin)**: Kapsamlı admin paneli, kullanıcı ve belge doğrulamaları (KYC), token ve bakiye yönetimi, sistem analitiği.

---

## 🛠 Teknoloji Yığını (Tech Stack)

Proje tamamen modern web standartlarında ve yüksek performanslı araçlarla inşa edilmiştir:

- **Framework**: [Next.js 16.x (App Router)](https://nextjs.org/) & React 19
- **Dil**: TypeScript
- **Veritabanı & ORM**: MySQL & [Prisma ORM](https://www.prisma.io/)
- **Stil & UI**: [Tailwind CSS v4](https://tailwindcss.com/), Framer Motion (Animasyonlar)
- **Kimlik Doğrulama**: NextAuth.js (v5) + Google/Apple/Facebook OAuth
- **Gerçek Zamanlı İletişim (WebSocket)**: Pusher (Canlı Mesajlaşma)
- **Arka Plan İşlemleri & Cron**: Upstash Redis & Inngest
- **E-posta & Bildirimler**: Resend API & Firebase
- **Ödeme Altyapısı**: Stripe, Iyzico, PayTR

---

## ⚙️ Kurulum & Çalıştırma (Development)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Gereksinimler
- Node.js (v18 veya üzeri)
- MySQL Sunucusu (Örn: XAMPP, WAMP veya Docker)
- Git

### 2. Adımlar
```bash
# Projeyi klonlayın ve klasöre girin
cd umrebuldum/frontend

# Bağımlılıkları yükleyin (pnpm önerilir)
npm install

# .env.local dosyanızı oluşturun (Örnek env dosyasındaki bilgileri doldurun)
# Veritabanını oluşturun ve Prisma şemasını yükleyin
npx prisma generate
npx prisma db push

# Geliştirme sunucusunu başlatın
npm run dev
```
Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

---

## 🔐 Ortam Değişkenleri (.env.local)

Projenin düzgün çalışması için `frontend/.env.local` dosyasında aşağıdaki ayarların bulunması zorunludur:

- **`DATABASE_URL`**: MySQL bağlantı cümleniz (Örn: `mysql://root:@localhost:3306/umrebuldum`)
- **`AUTH_SECRET`**: NextAuth güvenlik anahtarı (Rastgele oluşturulmuş güçlü bir şifre)
- **`NEXTAUTH_URL`**: Projenizin çalıştığı ana URL (Canlıda kendi domaininiz olmalı)
- **OAuth Keyleri**: Google, Apple, Facebook girişleri için `AUTH_GOOGLE_ID` ve `SECRET` vb.
- **`RESEND_API_KEY`**: E-posta gönderimi için Resend API anahtarı.
- **`PUSHER_APP_ID` vb.**: Canlı sohbetin çalışması için Pusher hesap bilgileri.
- **`UPSTASH_REDIS_REST_URL`**: Rate-limit (bot engelleme) ve sayaçlar için Redis adresi.

---

## 🚀 Canlıya Alma (Deployment)

Proje **Vercel** veya **VPS (Ubuntu)** üzerinde çalışmak üzere optimize edilmiştir. 

### Vercel Üzerinde Deploy (Önerilen)
1. Kodlarınızı GitHub'a yükleyin.
2. Vercel paneline girip "Add New Project" deyin ve GitHub deponuzu seçin.
3. Framework Preset olarak **Next.js** otomatik seçilecektir.
4. `Environment Variables` kısmına `.env.local` dosyanızdaki tüm ayarları birebir kopyalayın.
5. "Deploy" butonuna basın. (Veritabanınızın internete açık uzak bir MySQL sunucusu olması gerekmektedir, örn: PlanetScale, AWS RDS vb.)

### VPS/Sunucu Üzerinde Deploy (Örn: Ubuntu + PM2)
Eğer Vercel yerine kendi sunucunuzu kullanacaksanız:
```bash
npm install
npx prisma generate
npm run build
pm2 start npm --name "umrebuldum" -- start
```
*Not: Sunucunuzda Nginx ile 3000 portunu domaininize (Reverse Proxy) yönlendirmeniz gerekmektedir.*

---

## 🛠 Bakım & Operasyon

- **Veritabanı Yedeklemesi**: MySQL veritabanınızı periyodik olarak yedeklediğinizden emin olun.
- **Cron Joblar**: Sistemdeki geciken mesajların temizlenmesi veya günlük token bakiyelerinin güncellenmesi gibi işlemler için `src/app/api/cron/...` endpointleri vardır. Bunları sunucunuzda (cPanel Cron Jobs veya Vercel Cron) günlük/saatlik tetiklenecek şekilde ayarlayın.
- **Admin Paneli**: Tüm onay işlemleri (Rehber Onayı, Kimlik Doğrulamaları, Yorum Kontrolleri) sisteme "Admin" yetkisiyle giren bir kullanıcının `/admin` adresindeki panelinden yürütülür.

---

## 🎯 İleride Yapılacaklar (Roadmap)

Projenin bir sonraki fazları için planlanan geliştirmeler:

- [ ] **Mobil Uygulama (React Native)**: Web projesinin native iOS ve Android versiyonlarının PWA (Progressive Web App) haricinde uygulama marketlerine yüklenmesi.
- [ ] **Gelişmiş AI Chatbot**: Kullanıcı taleplerini anlayıp doğru rehberle eşleştiren Yapay Zeka destekli müşteri temsilcisi entegrasyonu.
- [ ] **Çoklu Dil (i18n)**: Arapça, İngilizce ve diğer dillere tam uyumluluk (RTL desteği eklendi, dil paketleri entegre edilecek).
- [ ] **Kredi Kartı ile Doğrudan Taksitli Ödeme**: Stripe ve PayTR altyapısı üzerinden kullanıcıların turları online satın alıp taksitlendirebilmesi.

---
*Bu sistem modern güvenlik mimarisi (Idempotency Key, CSRF, Rate Limiting) ile korunmaktadır ve yatayda büyümeye (Scale-out) uygun tasarlanmıştır.*
