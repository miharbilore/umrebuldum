# 🚀 Umrebuldum.com - Hostinger MVP Yol Haritası

**Versiyon:** 2.0  
**Tarih:** 2026-02-03  
**Platform:** Hostinger Paylaşımlı Hosting

---

## 📊 Platform Kısıtlamaları

| Özellik | Hostinger Shared | Çözüm |
|---------|------------------|-------|
| Python/Node.js | ❌ | Sadece PHP |
| Redis | ❌ | LiteSpeed Cache / Transients |
| Docker | ❌ | Doğrudan PHP |
| Custom Ports | ❌ | Sadece 80/443 |
| Cron Jobs | ✅ | WP Cron + cPanel |
| PHP 8.x | ✅ | GD/Imagick mevcut |
| MySQL | ✅ | WordPress DB |
| SSL | ✅ | Let's Encrypt |

---

## 🎯 PHASE 1: MVP (Şu An Yapılacaklar)

### ✅ Tamamlandı
- [x] wp-config.php güvenlik & bellek optimizasyonu
- [x] .htaccess sertleştirme
- [x] MU-Plugin performans optimizasyonları
- [x] Gereksiz eklenti temizliği

### 🔲 Yapılacak (Bu Hafta)

| Bileşen | Plugin | Öncelik |
|---------|--------|---------|
| **Afiş Üretimi** | `umrebuldum-poster-generator` | 🔴 Kritik |
| **Font Dosyaları** | Inter-Bold.ttf indir | 🔴 Kritik |
| **CDN** | Cloudflare Free | 🟠 Yüksek |
| **LiteSpeed Cache** | Yapılandır | 🟠 Yüksek |

### MVP Mimarisi

```
┌─────────────────────────────────────────────────┐
│              HOSTINGER SHARED                    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │               WORDPRESS                     │ │
│  │                                             │ │
│  │  ┌──────────┐  ┌──────────────────────┐    │ │
│  │  │HivePress │  │Poster Generator (PHP)│    │ │
│  │  │+ Addons  │  │- GD/Imagick          │    │ │
│  │  │          │  │- 4 Template          │    │ │
│  │  │          │  │- 4 Boyut             │    │ │
│  │  └──────────┘  └──────────────────────┘    │ │
│  │                                             │ │
│  │  ┌──────────┐  ┌──────────────────────┐    │ │
│  │  │WooCommerce│ │MU-Plugin Optimizer   │    │ │
│  │  │+ Shopier │  │                      │    │ │
│  │  └──────────┘  └──────────────────────┘    │ │
│  │                                             │ │
│  └────────────────────────────────────────────┘ │
│                       │                          │
│                       ▼                          │
│  ┌──────────────┐ ┌──────────────┐              │
│  │    MySQL     │ │  LiteSpeed   │              │
│  │              │ │    Cache     │              │
│  └──────────────┘ └──────────────┘              │
│                                                  │
└─────────────────────────────────────────────────┘
          │
          ▼
    ┌───────────┐
    │Cloudflare │
    │ Free CDN  │
    └───────────┘
```

### MVP Dosya Yapısı

```
wp-content/
├── mu-plugins/
│   └── umrebuldum-optimizer.php     ✅ Mevcut
│
├── plugins/
│   ├── hivepress/                    ✅ Mevcut
│   ├── umrebuldum-poster-generator/  ✅ YENİ
│   │   ├── umrebuldum-poster-generator.php
│   │   └── fonts/
│   │       └── Inter-Bold.ttf        🔲 İndirilecek
│   └── ...
│
├── uploads/
│   └── posters/                      ✅ Otomatik oluşur
│       └── poster_123_instagram_default_1706912345.png
```

---

## 🔷 PHASE 2: Growth (1-2 Ay Sonra)

### Gereksinimler
- Hostinger'da kalınabilir
- Harici servisler eklenebilir

### Eklenecekler

| Bileşen | Çözüm | Maliyet |
|---------|-------|---------|
| **JWT Auth** | WP Plugin | Ücretsiz |
| **Mobil API** | Custom endpoints | Ücretsiz |
| **WhatsApp** | Meta Cloud API | Ücretsiz (1000 msg/ay) |
| **Push Notif** | Firebase | Ücretsiz tier |
| **Email** | Mailgun/SendGrid | Ücretsiz tier |

### Phase 2 Mimarisi

```
┌─────────────────────────────────────────────────┐
│              HOSTINGER SHARED                    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │               WORDPRESS                     │ │
│  │  ┌──────────┐  ┌────────────┐              │ │
│  │  │ JWT Auth │  │ Mobile API │              │ │
│  │  │ Plugin   │  │ Endpoints  │              │ │
│  │  └──────────┘  └────────────┘              │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
          │
          ▼ Webhook/API
┌─────────────────────────────────────────────────┐
│           EXTERNAL SERVICES (Free Tier)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐     │
│  │ WhatsApp │ │ Firebase │ │  Cloudinary  │     │
│  │Cloud API │ │ FCM      │ │  (Görsel)    │     │
│  └──────────┘ └──────────┘ └──────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 🔶 PHASE 3: Scale (3-6 Ay Sonra)

### Gereksinimler
- **VPS'e geçiş** (Hostinger VPS veya DigitalOcean)
- Docker kullanımı
- Redis, Queue sistemi

### Eklenecekler

| Bileşen | Teknoloji | Hosting |
|---------|-----------|---------|
| **API Gateway** | Nginx | VPS |
| **Redis Cache** | Redis 7 | VPS |
| **Queue System** | Celery/BullMQ | VPS |
| **Python Poster** | FastAPI | VPS (Docker) |
| **WhatsApp Bot** | Node.js | VPS (Docker) |
| **Affiliate** | Özel Plugin | WordPress |
| **Premium Üyelik** | WooCommerce Subscriptions | WordPress |

### Phase 3 Mimarisi

```
                    ┌─────────────┐
                    │ Cloudflare  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │
                    │ API Gateway │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │WordPress │    │ Poster   │    │ WhatsApp │
    │ (PHP)    │    │ Service  │    │   Bot    │
    │          │    │ (Python) │    │ (Node)   │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
              ┌─────────────────────┐
              │ MySQL │ Redis │ S3 │
              └─────────────────────┘
```

---

## 📋 Bileşen Geçiş Matrisi

| Bileşen | MVP | Phase 2 | Phase 3 |
|---------|-----|---------|---------|
| **İlan Sistemi** | HivePress (WP) | HivePress (WP) | HivePress (WP) |
| **Afiş Üretimi** | PHP/GD Plugin | PHP/GD Plugin | Python FastAPI |
| **Cache** | LiteSpeed | LiteSpeed | Redis |
| **Queue** | WP Cron | WP Cron | Celery/BullMQ |
| **CDN** | Cloudflare Free | Cloudflare Free | Cloudflare Pro |
| **Auth** | WP Session | JWT Plugin | OAuth 2.0 |
| **Mobil API** | Yok | REST Endpoints | API Gateway |
| **WhatsApp** | Yok | Cloud API Webhook | Node.js Bot |
| **Push** | Yok | Firebase | OneSignal |
| **Affiliate** | Yok | Yok | Özel Plugin |
| **Premium** | Yok | Yok | WooCommerce Sub |
| **Hosting** | Shared | Shared | VPS |
| **Docker** | Yok | Yok | ✅ Docker Compose |
| **Redis** | Yok | Yok | ✅ Redis Server |
| **API Gateway** | Yok | Yok | ✅ Nginx/Kong |

---

## 💰 Maliyet Tahmini

| Phase | Aylık Maliyet | Notlar |
|-------|---------------|--------|
| **MVP** | ~100 TL | Hostinger Shared + Domain |
| **Phase 2** | ~150 TL | + Cloudflare (Free tier harici servisleri) |
| **Phase 3** | ~500-800 TL | VPS + Servisleri |

---

## ✅ Hemen Yapılacaklar Checklist

### 1. Font İndir
```bash
# Inter-Bold.ttf indir
# https://fonts.google.com/specimen/Inter
# wp-content/plugins/umrebuldum-poster-generator/fonts/ içine koy
```

### 2. Plugin Aktive Et
```
WP Admin → Eklentiler → "Umrebuldum Poster Generator" → Etkinleştir
```

### 3. Test Et
```
WP Admin → HivePress → 🖼️ Afişler → Test Üretimi
```

### 4. LiteSpeed Ayarları
```
WP Admin → LiteSpeed Cache → Genel → Cache Etkinleştir
```

### 5. Cloudflare Bağla
```
Cloudflare.com → Site Ekle → DNS ayarla → SSL: Full
```

---

## 🗑️ Kaldırılan Gereksiz Bileşenler (MVP için)

| Eski Plan | Neden Kaldırıldı |
|-----------|------------------|
| Python Poster Service | Hostinger'da çalışmaz |
| Redis | Hostinger'da yok |
| Celery Queue | Python gerektirir |
| Docker Compose | Paylaşımlı hosting'de yok |
| API Gateway | Gereksiz karmaşıklık |
| Node.js Bot | Phase 3'e ertelendi |

---

**Hazırlayan:** Umrebuldum Team  
**Son Güncelleme:** 2026-02-03
