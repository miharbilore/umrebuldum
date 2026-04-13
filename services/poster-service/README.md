# 🐍 Poster Service (Python/FastAPI)

## ⚠️ PHASE 3 İÇİN SAKLI

Bu klasördeki dosyalar **VPS'e geçiş** yapıldığında kullanılacak.

**Hostinger paylaşımlı hosting'de ÇALIŞMAZ!**

---

## Ne Zaman Kullanılacak?

| Koşul | Gerekli mi? |
|-------|-------------|
| VPS veya Dedicated Server | ✅ Evet |
| Docker kurulu | ✅ Evet |
| Python 3.10+ | ✅ Evet |
| Redis | ✅ Evet |

---

## MVP İçin Alternatif

Şu an **PHP/GD tabanlı** plugin kullanılıyor:

```
wp-content/plugins/umrebuldum-poster-generator/
```

Bu plugin Hostinger paylaşımlı hosting'de sorunsuz çalışır.

---

## Phase 3'te Aktifleştirme

```bash
# 1. VPS'te Docker kur
# 2. Bu klasörü kopyala
# 3. Docker ile çalıştır

cd services/poster-service
docker build -t umrebuldum-poster .
docker run -d -p 8001:8001 umrebuldum-poster
```

---

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `main.py` | FastAPI uygulaması |
| `poster_generator.py` | Pillow ile görsel üretimi |
| `requirements.txt` | Python bağımlılıkları |
| `Dockerfile` | (Eklenecek) |
