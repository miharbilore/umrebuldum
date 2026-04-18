import { Metadata } from "next";
import { Shield, FileText } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "KVKK Aydınlatma Metni | Umrebuldum",
        description: "6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metnimiz.",
    };
}

export default function KvkkPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    KVKK Aydınlatma Metni
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınız ve veri işleme politikamız.
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-800">
                    <p className="text-sm m-0">
                        Umrebuldum olarak kişisel verilerinizin güvenliğine en üst düzeyde önem veriyoruz. Bu sorumluluk bilinciyle, hizmetlerimizden faydalanan siz değerli misafirlerimizin, işbirliği içinde olduğumuz acentelerin ve diğer 3. tarafların kişisel verilerini Türkiye Cumhuriyeti <strong>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK")</strong> ve ilgili hukuki mevzuata sıkı surette bağlı kalarak işliyor ve koruyoruz.
                    </p>
                </div>

                <h2>1. Veri Sorumlusunun Kimliği</h2>
                <p>
                    KVKK uyarınca, Umrebuldum sitesi olarak "Veri Sorumlusu" sıfatıyla,
                    kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında; hukuka ve dürüstlük kurallarına uygun bir şekilde, veri boyutunda bağlantılı, meşru, ölçülü bir biçimde işlemekte ve muhafaza etmekteyiz.
                </p>

                <h2>2. İşlenen Kişisel Verileriniz ve Hukuki Sebebi</h2>
                <p>
                    Tarafımızca, sizinle olan sözleşmesel veya hukuki ilişkimiz çerçevesinde;
                </p>
                <ul>
                    <li><strong>Kimlik Verileriniz:</strong> Adınız, soyadınız, TC kimlik numaranız (ödeme/fatura durumunda). Hukuki sebep: "Sözleşmenin İfası" ve "Kanunlarda Açıkça Öngörülmesi".</li>
                    <li><strong>İletişim Verileriniz:</strong> Telefon numaranız, e-posta adresiniz, fatura ve posta adresiniz. Hukuki sebep: "Sözleşmenin İfası" ve "Meşru Menfaatlerimiz".</li>
                    <li><strong>İşlem Güvenliği Verileriniz:</strong> Web sitesi şifreniz, IP adresi kayıtları, Çerez (Cookie) verileriniz, oturum kimliği gibi erişim cüzdanı verileriniz. Hukuki sebep: "Veri Sorumlusunun Hukuki Yükümlülüğü (5651 Sayılı Kanun)".</li>
                    <li><strong>Finansal Veriler(Sadece VIP Acenteleri İçin):</strong> Kredi kartı tahsilatları ödeme altyapısı iyzico/PayTR arayüzünden doğrudan gerçekleşir. Kredi kartı numaranız, CVC kodunuz sunucularımızda KESİNLİKLE saklanmaz!</li>
                </ul>

                <h2>3. Acenteler ("Veri İşleyen") İle Veri Paylaşımı</h2>
                <p>
                    Platformumuz üzerinden bir tur için <strong>"Teklif İste"</strong> butonuna bastığınızda, o tur yetkili acenteye ("Veri İşleyen"), iletişim kurabilmesi (WhatsApp vb.) ve siparişin detaylarını netleştirebilmesi adına "Ad, Soyad, Telefon Numarası" verileriniz iletilir. Acenteler, bu verileri yalnızca bahsi geçen rezervasyon konusu için işleme ve ardından güvenli şekilde yasal saklama sürelerine riayet ederek muhafaza/imaha etmekle yükümlüdür.
                </p>

                <h2>4. İlgili Kişinin (Veri Sahibinin) Hakları (KVKK Madde 11)</h2>
                <p>KVKK'nın 11. maddesi uyarınca veri sahipleri (ilgili kişiler) aşağıdaki haklara sahiptir:</p>
                <ul>
                    <li>Kişisel veri işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme,</li>
                    <li>Kişisel verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                    <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
                    <li>Eksik/yanlış işleme varsa düzeltilmesini isteme (Profil alanından bizzat düzeltilebilir),</li>
                    <li>Kişisel verilerin silinmesini ("Unutulma Hakkı") isteme.</li>
                </ul>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                    <h3 className="flex items-center gap-2 font-bold mb-4">
                        <FileText className="w-5 h-5" /> Başvuru Yöntemi
                    </h3>
                    <p className="text-sm text-muted-foreground">Yukarıda sayılan haklarınızı kullanmak dahilinde, taleplerinizi kimligÌ†inizi ispat edici belgeler ile yazılı ve ıslak imzalı olarak sirket adresimize iletebilir veya <strong>kvkk@umrebuldum.com</strong> adresine e-posta vasıtasıyla ileterek haklarınızı kullanabilirsiniz.</p>
                </div>
            </div>
        </div>
    );
}
