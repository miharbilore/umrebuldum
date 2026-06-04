/**
 * Disclaimer.tsx — Hukuki Sorumluluk Reddi ve Kullanım Koşulları Bileşeni
 *
 * Bu bileşen, kayıt ekranlarında, footer'da veya ayrı bir /legal sayfasında
 * kullanılabilir. Platformun hukuki güvencesini sağlar.
 */

import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
    return (
        <section className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">
                    Kullanım Koşulları ve Sorumluluk Reddi
                </h2>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4 text-sm leading-relaxed text-gray-700">
                <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">1. Platform Rolü</h3>
                    <p>
                        Platformumuz, hizmet verenler ile hizmet alanları bir araya getiren
                        bağımsız bir aracıdır. Umrebuldum.com, yayınlanan ilanların
                        içeriğinden, doğruluğundan veya sunulan hizmetin kalitesinden
                        doğrudan sorumlu değildir.
                    </p>
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">2. Ticari Anlaşmazlıklar</h3>
                    <p>
                        Kullanıcılar arasındaki herhangi bir ticari anlaşmazlık, tur iptali
                        veya maddi kayıptan platformumuz sorumlu tutulamaz. Taraflar
                        arasındaki ihtilaflar, Türkiye Cumhuriyeti yasaları ve ilgili tüketici
                        hakem heyetleri çerçevesinde çözülür.
                    </p>
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">3. Platform Dışı Ödemeler</h3>
                    <p>
                        Kullanıcılar, platform dışı ödeme kanallarını (Elden, EFT, Havale)
                        kullanırken tüm riskin kendilerine ait olduğunu kabul eder.
                        Güvenliğiniz için yalnızca TÜRSAB belgeli ve kimlik doğrulaması
                        yapılmış acentelerle çalışmanızı ve mümkünse platform içi ödeme
                        yöntemlerini tercih etmenizi şiddetle tavsiye ederiz.
                    </p>
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">4. Kişisel Verilerin Korunması</h3>
                    <p>
                        Kişisel verileriniz, 6698 sayılı KVKK kapsamında işlenmekte ve
                        korunmaktadır. Detaylar için Gizlilik Politikamızı inceleyiniz.
                    </p>
                </div>
            </div>

            <p className="text-xs text-gray-400 text-center pt-2">
                Bu koşulları kabul ederek platformumuzu kullanmaya devam etmiş sayılırsınız.
            </p>
        </section>
    );
}
