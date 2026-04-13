# 🚀 UmreBuldum Deployment (Canlıya Alma) Rehberi

Bu dosya, projeyi tıpı Vercel, DigitalOcean veya benzeri bir sunucuda canlıya (production) alırken **adım adım** dikkat edilmesi gerekenleri içerir. Bu kuralları takip etmek olası güvenlik, veritabanı yansımaması veya ödeme senkronizasyon hatalarını engelleyecektir.

---

## 1. Veritabanı (Database) Hazırlığı

Canlı veritabanına bağlandığınızda, geliştirme (development) ortamındaki değişikliklerin üretim (production) ortamına yansıtıldığından emin olun.

1. **Bağlantı URI'si**: Canlı MySQL/PostgreSQL veritabanı URI'sini `.env` veya Hosting/Vercel panelindeki `DATABASE_URL` ortam değişkenine ekleyin.
2. **Prisma Şeması Eşitleme**:
   Eğer veritabanı boşsa veya tabloları oluşturacaksanız:
   ```bash
   npx prisma db push
   ```
   *(Eğer Prisma Migrate kullanıyorsanız `npx prisma migrate deploy` komutunu tercih edebilirsiniz).*
3. **Client Oluşturma**:
   Dağıtım (build) aşamasından önce mutlaka Prisma Client'in canlı ortama uygun olarak güncellenmesi gerekir. (Vercel bunu genelde build sırasında otomatik yapar ancak manuel build alıyorsanız unutmayın).
   ```bash
   npx prisma generate
   ```

---

## 2. Ortam Değişkenleri (Environment Variables)

Prod ortamınızda `.env.local` dosyası yerine, barındırma sağlayan platformun (ör. Vercel) **Environment Variables** bölümünü kullanın. Eksiksiz olması gereken kritik değişkenler şunlardır:

### 🔑 Güvenlik & Auth
- `AUTH_SECRET`: NextAuth/Auth.js için **kesinlikle** güçlü ve eşsiz bir şifre olmalıdır. (`openssl rand -base64 32` komutuyla üretebilirsiniz)
- `AUTH_URL` / `NEXTAUTH_URL`: Canlı projenizin tam URL'si. (ör: `https://umrebuldum.com`)
- `AUTH_TRUST_HOST`: `true` olarak bırakabilirsiniz.

### 💳 Stripe & Ödeme Sistemi
- `STRIPE_SECRET_KEY`: Stripe panelinden alınan **Live (Canlı)** gizli anahtar (`sk_live_...`).
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook oluşturulduktan sonra verilen webhook imzası onay anahtarı (`whsec_...`).

### ⚙️ Altyapı
- `CRON_SECRET`: Vercel cron tetiklemeleri veya dışarıdan gelen cron endpoint çağrıları için güçlü bir şifre. (Bunu bilmeyenler veritabanında ödeme uzlaştırmasını çalıştıramaz).
- `DATABASE_URL`: Canlı MySQL bağlantı cümlesi.
- `NEXT_PUBLIC_WORDPRESS_URL`: WordPress entegrasyonu kullanılıyorsa, çalışan canlı adres.
- Social Login ID/Secret (`AUTH_GOOGLE_ID`, `AUTH_APPLE_ID` vs.) canlı uygulamalar için oluşturulmuş olmalıdır.

---

## 3. Stripe Webhook Tanımlama (Kritik!)

Ödemelerin hesaba başarılı yansıması ve kullanıcı bakiyelerinin otomatik yüklenmesi için Stripe'a uygulamanızın endpoint'ini bildirmeniz **zorunludur**:

1. [Stripe Dashboard](https://dashboard.stripe.com) > **Developers** > **Webhooks** bölümüne gidin.
2. **Add endpoint** (Endpoint ekle) butonuna tıklayın.
3. **Endpoint URL**: `https://www.umrebuldum.com/api/stripe/webhook` (kendi domaininize göre düzenleyin).
4. **Events to send** (Gönderilecek olaylar): 
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Kaydedin ve ekranda beliren **Signing secret** (İmza gizli anahtarı) değerini kopyalayıp prod ortamınızın `STRIPE_WEBHOOK_SECRET` değişkenine yapıştırın.

---

## 4. Reconcile (Kayıp Ödemeleri Telafi) Cron Job'ı

Eğer bir ağ hatasından dolayı Stripe webhook'u uygulamanıza ulaşmazsa, havada asılı kalan ödemeleri tamamlamak için cron job çalışmalıdır.

- **Vercel Üzerinde**: Projede bulunan `vercel.json` otomatik olarak `*/15 * * * *` (15 dakikada bir) `/api/cron/reconcile-payments` adresini tetikleyecek şekilde ayarlanmıştır.
- `CRON_SECRET` değişkeninin Vercel panelinde tanımlı olması tetikleyicinin güvenlik duvarını aşması için yeterlidir.
- **Vercel Kullanmıyorsanız**: Kendi sunucunuzda (cPanel vs.) şu crontab'i ekleyin:
  ```bash
  */15 * * * * curl -s -H "Authorization: Bearer BURAYA_CRON_SECRET_YAZIN" https://umrebuldum.com/api/cron/reconcile-payments
  ```

---

## 5. Build ve Sunucu Başlatma

Yukarıdaki her şey tamsa, son testlerinizi projeyi derleyerek yapabilirsiniz:

1. Modülleri yükleyin:
   ```bash
   npm install
   ```
2. Build işlemini başlatın (TypeScript hata kontrolü de yapacaktır):
   ```bash
   npm run build
   ```
3. Başarılı olduysa sunucuyu production modda başlatın:
   ```bash
   npm run start
   ```

*(Eğer Vercel üzerinden Github reposu bağlayarak deploy alıyorsanız bu build adımlarını Vercel kendi sunucularında yapacaktır. Yukarıdaki `.env` ayarlarının eksiksiz olduğundan emin olmanız yeterlidir).*

---

## 🎉 Deploy Başarılı Olduktan Sonra Yapılacak Genel Kontroller

- [ ] Ana sayfa açılıyor mu?
- [ ] Bir kullanıcı oluşturulup giriş yapılabiliyor mu? (Auth çalışıyor mu)
- [ ] Admin rolüne sahip profilden `Profil -> Admin Panel` sayfasına girilebiliyor mu?
- [ ] Kredi satın al denildiğinde Stripe ödeme penceresine (/checkout) gidip canlı ödeme denemesi yapılabiliyor mu? (Webhook'u zorlamak için test modunda bir ödeme deneyin).
- [ ] Satın aldıktan veya iptal ettikten sonra bakiyeler doğru yansıyor mu?
- [ ] Sohbet geçmişleri doğru listeleniyor mu? 

Bol şans ve başarılar! 🚀
