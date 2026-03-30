import { Metadata } from "next"
import { Copyleft, ShieldAlert, CreditCard } from "lucide-react"

export const metadata: Metadata = {
    title: "İade ve İptal Politikası | Umrebuldum",
    description:
        "Umrebuldum platformu üzerinden satın alınan üyelik paketleri ve ilan edilen tur rezervasyonlarının iptal koşulları hakkında bilgi.",
}

export default function RefundPolicyPage() {
    return (
        <div className="container py-16 md:py-24 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                    <Copyleft className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    İade ve İptal Politikası
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Acentelerimiz için platform abonelik iptalleri ve misafirlerimiz için tur paketlerine dair yasal sorumluluk reddi beyanımızı içerir.
                </p>
                <div className="text-sm text-muted-foreground">Son Güncelleme: 9 Mart 2026</div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-16 items-stretch">

                {/* Sol Sütun: Umrebuldum Üyelik ve Kredi Paketleri */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10" />
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold m-0">Üyelik ve Paket Acenteleri</h2>
                    </div>

                    <div className="space-y-6 text-muted-foreground flex-1">
                        <p className="text-foreground font-medium">Bu bölüm, platformumuzda "Acente" veya "Organizatör" sıfatıyla kayıtlı olan, kredi/jeton ve abonelik paketi satın alan üyelerimizi kapsar.</p>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-foreground font-semibold text-lg mb-2">1. 14 Günlük Cayma Hakkı</h3>
                                <p>Sistem üzerinden (Kredi kartı/EFT ile) satın alınan Premium üyelikler, ilan yayınlama hakları veya "Spotlight" (öne çıkarma) hizmetleri için, <strong>eğer hizmet henüz hiç kullanılmamışsa</strong> (ilan yayınlanmamış ve öne çıkarma başlamamışsa), satın alım tarihinden itibaren 14 gün içerisinde kesintisiz ve şartsız iade talep edilebilir.</p>
                            </div>

                            <div>
                                <h3 className="text-foreground font-semibold text-lg mb-2">2. Kullanılmış Hizmetlerde İade</h3>
                                <p>Satın alınan üyelik başlatıldıktan, ilan vitrine çıkarıldıktan veya özellikler (tokenlar) kısmen kullanıldıktan sonra Cayma Hakkı kullanılamaz ve <strong>kısmi iade yapılmaz.</strong></p>
                            </div>

                            <div>
                                <h3 className="text-foreground font-semibold text-lg mb-2">3. Kuralların İhlali</h3>
                                <p>Acentenin sisteme sahte evrak yüklemesi, dolandırıcılık teşebbüsü veya "İlan Yayınlama Şartları" belgesine ihtilaf etmesi nedeniyle Umrebuldum yönetimi tarafından mağazası kapatılırsa veya ilanları yayından kaldırılırsa bakiye ödemesi iade edilmez.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ Sütun: Umre Tur Paketleri Sorumluluk Reddi */}
                <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 dark:bg-red-900/10 rounded-bl-full -z-10" />
                    <div className="flex items-center gap-4 mb-6 border-b border-red-100 dark:border-red-900/30 pb-6">
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold m-0 text-red-900 dark:text-red-400">Tur Paketi İptalleri</h2>
                    </div>

                    <div className="space-y-6 text-red-800 dark:text-red-300 flex-1">
                        <div className="p-4 bg-white dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/50 shadow-sm">
                            <h3 className="font-bold text-red-900 dark:text-red-400 text-lg mb-1">Sorumluluk Reddi Bildirimi</h3>
                            <p className="text-sm">Umrebuldum, sadece T.C. Turizm Bakanlığı kayıtlı acentelere pazar yeri sağlayan bir aracı kurumdur. <strong>Sistemimizde gösterilen tur paketlerinin satıcısı veya düzenleyicisi değiliz.</strong></p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">1. Sözleşmenin Tarafları Biz Değiliz</h3>
                                <p>Platformumuz üzerinden görüntülediğiniz, "Teklif Al" butonuna tıklayarak veya listedeki numarayı arayarak satın aldığınız Umre / Hac / Kudüs turlarının tüm yasal, fiili ve finansal sözleşmesi tamamen <strong>sizinle rezervasyonu gerçekleştiren Acente</strong> arasındadır.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">2. Ödemeler ve Şikayetler</h3>
                                <p>Tur ücreti platformumuz üzerinden değil, doğrudan acentenin hesaplarına ödenir. Bu vesileyle turun gerçekleştirilmemesi, iptali, vize çıkmaması, uçağın kaçırılması, otelin taahhüt edilenden kötü çıkması gibi hallerden doğabilecek iade ve tazminat süreçlerinin hiçbirinde <strong>Umrebuldum sorumlu veya garantör değildir.</strong></p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">3. İptal Hususunda İletişim</h3>
                                <p>Satın almış bulunduğunuz turun iptali, no-show kesintisi oranları ve para iadesi talepleriniz için tamamen kayıt olduğunuz Acentenin kendi "TÜRSAB Mesafeli Satış Sözleşmesi" geçerlidir. Tüm iade talepleriniz için lütfen rezervasyon yaptırdığınız tur yetkilisine ulaşınız.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
