import { Metadata } from "next";
import { Gavel, Scale, FileText } from "lucide-react";

export const metadata: Metadata = {
    title: "Kullanım Koşulları | Umrebuldum",
    description: "Umrebuldum platformunu kullanırken uymanız gereken kurallar, kullanıcı yükümlülükleri ve yasal sorumluluklar.",
};

export default function TermsPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                    <Gavel className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Kullanım Koşulları
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Platformumuzu güvenli ve yasal bir çerçevede kullanabilmeniz için lütfen işbu koşulları dikkatlice okuyunuz.
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="flex justify-between items-center text-sm text-muted-foreground border-b border-border pb-4 mb-8">
                    <span>Yürürlük Tarihi: 09 Mart 2026</span>
                    <span>Sürüm: 2.1</span>
                </div>

                <h2>1. Taraflar ve Kabul</h2>
                <p>
                    İşbu Kullanım Koşulları ("Sözleşme"), UmreBuldum web sitesini ve mobil uygulamalarını
                    ("Platform") ziyaret eden, üye olan veya kullanan tüm gerçek ve tüzel kişiler ("Kullanıcı")
                    ile UmreBuldum ("Şirket") arasında bağlayıcıdır. Platformu ziyaret ederek veya "Kabul Ediyorum" seçeneğini işaretleyerek, işbu Sözleşme'deki şartları kabul etmiş sayılırsınız.
                </p>

                <h2>2. Platformun Hukuki Statüsü ve Hizmet Kapsamı</h2>
                <p>
                    UmreBuldum, Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında bir <strong>"Aracı Hizmet Sağlayıcı"</strong>dır. Şirketimiz:
                </p>
                <ul>
                    <li>Kendisi bir tur operatörü, turizm acentesi veya sağlayıcı <strong>değildir</strong>.</li>
                    <li>Sadece Hac ve Umre acentelerinin ("Organizatör/Satıcı") ilanlarını kullanıcılarla ("Alıcı") buluşturan bir pazar yeridir.</li>
                    <li>Listelenen turların gerçekleştirilmesi, vize alımı, otel kalitesi ve uçuş rötarları gibi süreçlerde hukuki muhatap <strong>ilân sahibi acentedir</strong>.</li>
                    <li>UmreBuldum, satıcıların ilan içerikleri (resimler, vaat edilen oteller) üzerinden garanti vermez, ancak yanıltıcı ilanları tespit ettiğinde derhal sistemden kaldırma yetkisine sahiptir.</li>
                </ul>

                <h2>3. Kayıt ve Hesap Güvenliği</h2>
                <ul>
                    <li>Platforma üye olmak için kullanıcıların 18 yaşını doldurmuş ve medeni hakları kullanma ehliyetine sahip olması zorunludur.</li>
                    <li>Hesap oluşturulurken verilen tüm kişisel veya kurumsal bilgilerin (Ad, Soyad, TC Kimlik, Vergi No) doğru ve güncel olması kullanıcının yükümlülüğündedir.</li>
                    <li>Kullanıcı parolasının güvenliğinden bizzat kendisi sorumludur. Hesabınız üzerinden yapılan işlemlerden (sizin dışınızda biri tarafından yapılsa bile) sizin sorumlu tutulacağınızı unutmayınız.</li>
                    <li>Aynı kullanıcı birden fazla sahte hesap (multi-account) açamaz. Tespiti halinde tüm hesaplar askıya alınır.</li>
                </ul>

                <h2>4. Kullanıcının Davranış Yükümlülükleri</h2>
                <p>Platformu kullanan kişi ve kurumlar aşağıdaki eylemlerden kaçınmayı kabul eder:</p>
                <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <div className="flex gap-3">
                            <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm">Hukuka, kamu düzenine ve genel ahlaka aykırı veya başkalarının telif hakkını ihlal eden içerikler yayınlamak.</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <div className="flex gap-3">
                            <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm">Otomatik botlar (spider, scraper vb.) kullanarak platformun veri tabanını izinsiz şekilde indekslemek veya kazımak.</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <div className="flex gap-3">
                            <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm">Sahte siparişler vererek veya sahte puanlama (manipüle yorum) yaparak acentelerin itibarını haksız yere etkilemek.</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <div className="flex gap-3">
                            <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm">Platform yazılımını hackleme, SQL Injection, DDOS gibi siber saldırılarda bulunmak, tersine mühendislik yapmak.</p>
                        </div>
                    </div>
                </div>

                <h2>5. Fikri Mülkiyet Hakları</h2>
                <p>
                    UmreBuldum "U", logo tasarımı, domain, kaynak kodları, yazılım algoritmaları ve platform mimarisinin tamamı dahil olmak üzere her türlü telif, marka hakkı Şirket'e aittir. Kullanıcıların yüklediği yorum ve resimler haricinde kaynak gösterilmeden veya yazılı izin alınmadan alıntı yapılamaz.
                </p>

                <h2>6. Sorumluluğun Sınırlandırılması ve Kesintiler</h2>
                <p>
                    Şirket, Platformun 7/24 kesintisiz çalışacağını ve virüs barındırmayacağını %100 garanti etmez. Planlı bakımlar, siber zorbalıklar ve telekomünikasyon altyapısına bağlı zorunlu kesintiler yüzünden doğabilecek veri kayıpları ve iş iptallerinde Şirket sorumlu tutulamaz.
                </p>

                <h2>7. Uyuşmazlık Çözümü</h2>
                <p>
                    İşbu Sözleşme'nin uygulanmasından ve yorumlanmasından doğacak uyuşmazlıklarda Türk Hukuku uygulanacaktır. Çözülemeyen uzlaşmazlıklarda yargı yetkisi münhasıran <strong>İstanbul Mahkemeleri ve İcra Dairelerine</strong> aittir. Tüketici sıfatını haiz müşteriler, uyuşmazlık durumunda yasal sınırları içerisindeki Tüketici Hakem Heyetleri'ne başvuruda bulunabilirler.
                </p>
            </div>
        </div>
    );
}
