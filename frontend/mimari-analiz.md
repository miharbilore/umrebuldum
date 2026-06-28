# UmreBuldum Platformu - Kapsamlı Mimari ve Tip Güvenliği Analiz Raporu

## 1. Veritabanı ve Çekirdek Varlıklar (Prisma Schema)

### Ana Aktörler
- **User (Kullanıcı):** Sistemin temel aktörü. Standart ziyaretçiler, Hacı adayları veya rehberlerin temel hesap bilgilerini tutar.
- **Guide (Rehber/Acente):** Kullanıcının genişletilmiş rolüdür. Hizmet sağlayıcıları temsil eder. Güven skoru, doğrulama durumu gibi metrikleri barındırır.

### Temel İş Modelleri
- **UmrahRequest (Talep/Demand):** Hacı adaylarının oluşturduğu hizmet talepleri.
- **GuideListing (İlan):** Rehberlerin verdiği hizmet paketleri.
- **Review (Değerlendirme):** İşlemler sonrası verilen puanlamalar.
- **RiskScore & RiskEvent:** Fraud (sahtekarlık) modülünün kullanıcı risklerini takip ettiği veri modelleri.

## 2. Temel Modüller ve İş Mantığı (src/modules & src/lib)

Sistem Domain-Driven Design (DDD) pratiklerine benzer bir modüler yaklaşıma sahiptir:

- **fraud:** Sistemdeki sahte hesapları, haksız puan kazanımını (Sybil atakları) ve riskli davranışları (iptal silahlaştırması vb.) tespit eder ve skorlar (RiskScoring, SybilRealtime, AtomicTrust).
- **matching:** Kullanıcıların talepleri ile rehberlerin ilanlarını eşleştirir. Belirli kurallara (SLA, WaveTier, performans) göre uygun acenteleri bulur.
- **rankings / ranking:** Rehber ilanlarının arama sonuçlarında hangi sırada çıkacağını belirler. EMA (Exponential Moving Average) ve çeşitli güven skorlarını harmanlar.
- **reviews:** Yorum ve puanlamaların dürüstlüğünü denetler. IntegrityEngine (Bütünlük Motoru) aracılığıyla fake (sahte) yorumları filtreler.
- **tokens:** Sistem içi kredi/ödeme veya limit mekanizmalarını yönetir.

## 3. Tip Güvenliği Durumu ve Plan (Prisma Tipleri)
Şu anda kod tabanında (özellikle Fraud ve Ranking modüllerinde) Prisma dönüş tipleri ve JSON verileri yerine `any` veya `Record<string, unknown>` kullanılmıştır. Transaction nesneleri de genelde `unknown` veya `any` olarak geçilmektedir. Tip güvenliğini sağlamak için Prisma'nın otomatik oluşturduğu `Prisma.TransactionClient`, `Prisma.InputJsonObject`, `Prisma.GuideListingGetPayload` ve `Prisma.UmrahRequestGetPayload` gibi tipler koda entegre edilecektir.
