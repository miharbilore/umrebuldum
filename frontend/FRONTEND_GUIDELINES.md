# Umrebuldum Front-End Constitution (Önyüz Anayasası)

Bu belge, Umrebuldum web platformunun önyüz geliştirmesi (Front-End) sırasında uyulması gereken **katı, değiştirilemez anayasa kurallarıdır**. Tüm takım üyeleri, yapay zeka asistanları ve kod üreticileri bu kurallara uymakla yükümlüdür.

## 1. GÖRSEL KURALLARI (NO CLS Politikası)
Kümülatif Düzen Kaymasını (Cumulative Layout Shift) sıfıra indirmek ve performans optimizasyonu sağlamak esastır.
- **Yasaklar:** Standart HTML `<img>` etiketinin kullanımı **kesinlikle yasaktır**.
- **Zorunluluklar:** Resimler daima `next/image` (özellikle `<Image fill />` veya sabit boyut) ile yüklenecektir.
- **Biçimlendirme:** Görsellerin sayfa yüklenirken dışarı taşmasını veya kaymasını engellemek için CSS `object-cover` ve `aspect-` (örn: `aspect-square`, `aspect-video`) sınıfları zorunludur.
- **Geri Dönüş (Fallback):** Veritabanından veya S3'ten resim gelmeme ya da yükleme hatası durumunda **asla boş bir alan veya kırık ikon gösterilmeyecektir**. Ya kullanıcının isminin baş harflerini içeren ya da şirket amblemi olan bir "Fallback" bileşeni (Örn: `<SmartAvatar>`) devreye girecektir.

## 2. YERELLEŞTİRME VE TERMİNOLOJİ
Kullanıcının gördüğü (client-facing) tüm arayüzlerde dil %100 Türkçe olmalıdır.
- **Proje Bağlamında Sabit Çeviriler:**
  - `Guide` -> Rehber veya Umre Danışmanı
  - `Agency` -> Kurumsal Acente
  - `Reviews` -> Değerlendirmeler
  - `Book / Request Tour` -> Talep Gönder
  - `Experience` -> Sektör Tecrübesi
  - `Trust Score` -> Güven Skoru
- **UTF-8 Karakterler:** Türkçe karakterlerin (ı, ş, ğ, ü, ö, ç) dosya kaydedilirken bozulmasına asla mahal verilmeyecektir.

## 3. MOBİL UYUM (RESPONSIVE)
Mobil uyum sonradan eklenecek bir cila değil, birinci önceliktir (Mobile-First).
- **Yatay Kaydırma:** Mobile görünümde ekran dışına taşkınlık (overflow) yapan yapılar kabul edilmez. Daima kapsayıcı öğelerde boyutlar `w-full` veya `max-w-md` vb. kurallarla sınırlandırılacaktır.
- **Dokunma Alanları:** Mobilde parmakla dokunulan tüm tıklanabilir alanlar (Butonlar, Linkler, Tabs) en küçük **44px** basma yüksekliğine (`min-h-11`) ve genişliğine sahip olacaktır.

## 4. SEO VE URL MİMARİSİ
Açık internet evrenine (Public) hitap eden vitrin sayfaları katı SEO kurallarına tabidir.
- **Slug Kullanımı:** Rehber ve acente profilleri sadece ID bazlı değil, okunabilir Slug ile birlikte yönlendirilecektir (Örn: `/rehber/123-ahmet-yilmaz` formatına hazırlık yapılacaktır).
- **Metadata:** Kullanıcıya (müşteriye) açık `page.tsx` dosyaları kesinlikle düz bir export ile bırakılamaz. `generateMetadata` fonksiyonu export edilerek sayfanın Dynamic Title ve Meta Description etiketlerini basması **zorunludur**.
