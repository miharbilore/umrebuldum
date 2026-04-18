import { Metadata } from "next";
import { ListChecks, AlertTriangle, Building2, CheckCircle2 } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "İlan Yayınlama Şartları | Umrebuldum",
        description: "Organizatörlerin ve acentelerin Umrebuldum platformunda ilan yayınlarken uyması gereken şeffaflık kuralları.",
    };
}

export default function ListingTermsPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <ListChecks className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    İlan Yayınlama Şartları
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Kullanıcılarımızın doğru karar vermesini sağlamak adına, platformda ilan verecek olan
                    tüm acentelerin uyması gereken katı standartlar.
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 md:p-12 rounded-3xl mt-12">
                <h2>1. Onaylı Acente Olma Şartı</h2>
                <p>
                    Umrebuldum, sahtekarlıkların ve mağduriyetlerin önüne geçmek maksadıyla yalnızca T.C. Kültür ve Turizm Bakanlığı'na ve <strong>TÜRSAB</strong>'a kayıtlı, lisanslı "A Grubu Seyahat Acenteleri"ne ilan yayınlama yetkisi verir.
                </p>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl not-prose my-6">
                    <Building2 className="w-6 h-6 text-indigo-500 mt-1 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Bireysel kişi veya gruplar ("çantacı" tabir edilen lisanssız kişiler) platformda katiyen mağaza açamaz ve tur satışı ilanları listeleyemezler.</p>
                    </div>
                </div>

                <h2>2. Şeffaf Fiyatlandırma Politikası</h2>
                <p>
                    Listelenen kümülatif fiyat, yolcunun ödeyeceği <strong>Net/Toplam Fiyat</strong> olmak zorundadır.
                </p>
                <ul>
                    <li>İlan başlığında ve etiketlerde "600$'dan başlayan fiyatlarla" gibi aldatıcı pazarlama ifadelerine yer verilemez ancak fiyat, oda (4 kişilik, 3 kişilik, 2 kişilik vb.) bazında farklılık gösteriyorsa bu durum Varyant fiyatlarıyla net şekilde yansıtılmalıdır.</li>
                    <li>Vize, uçak biletleri ve havalimanı vergileri gibi gizli veya zorunlu ek maliyetler var ise fiyata dahil edilmek ZORUNDADIR. Yolcudan sonradan "sigorta bedeli", "rehberlik harcı" vb. talep edilecekse bu ilan detayında açıkça beyan edilmelidir.</li>
                </ul>

                <h2>3. Medya ve Materyal Kuralları</h2>
                <p>İlan kapak fotoğrafları (Posterleri) ve galeri görselleri aşağıdaki kurallara bağlıdır:</p>
                <ul>
                    <li>Stok fotoğraf kullanımından ziyade (özellikle kalınacak olan Mekke ve Medine otellerini) acentenin bizzat çektiği veya otelin resmi güncel fotoğrafları sisteme yüklenmelidir.</li>
                    <li>Otel Kabe'ye/Harameyn'e 2 km uzaklıkta olduğu halde fotoğraflarda "Sıfır Mesafe" algısı yaratacak perspektif oyunlarının kullanımı tespiti halinde ilanın kalıcı silinmesine sebep olur.</li>
                    <li>Sistem tarafından sağlanan Otomatik Poster Oluşturucu araçlarının kullanımı tavsiye edilir.</li>
                </ul>

                <h2>4. Tarih ve İptal Garantisi</h2>
                <p>
                    Yayınlanan turların gidiş ve dönüş tarihleri, havayolu firmasından uçuşların onaylanmış olduğu durumlarda "Kesin Kalkışlı" etiketiyle yayınlanmalıdır. Tarihte oynama yapılma ihtimali varsa ("Planlanan") olarak belirtilmelidir.
                </p>

                <div className="flex bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 p-4 rounded-xl mt-8 not-prose gap-4 items-start border border-red-100 dark:border-red-900/50">
                    <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="m-0 text-sm">Umrebuldum idari heyeti; eksik bilgi, sahte görsel veya yolcuları yanıltmaya yönelik herhangi manipülatif bir veriye rastlaması halinde bildirim yapmaksızın mağazayı platformdan uzaklaştırma ve mevcut bakiyelere (token) tedbir koyma hakkını saklı tutar.</p>
                </div>
            </div>
        </div>
    );
}
