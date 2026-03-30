import { Metadata } from "next";
import { FileCheck, MailCheck, BellPlus } from "lucide-react";

export const metadata: Metadata = {
    title: "Açık Rıza Metni | Umrebuldum",
    description: "Elektronik ticari ileti gönderimine ilişkin onay ve rıza beyanınız.",
};

export default function ConsentPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <FileCheck className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Açık Rıza ve Ticari İleti Metni
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Kişisel verilerinizin kampanyalar ve tanıtımlar amacıyla kullanılmasına izin şartları.
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="p-8 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-3xl mt-12 text-center text-sm md:text-base leading-relaxed">
                    <p className="font-medium">
                        Umrebuldum tarafından, Kişisel Verilerin Korunması Kanunu ("KVKK") ve Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ("ETK") hükümleri kapsamında;
                        Kayıt olduğum E-Posta adresimi ve Mobil Telefon Numarası bilgilerimi kullanmak suretiyle,
                    </p>
                    <div className="flex justify-center gap-6 my-6 not-prose">
                        <div className="flex flex-col items-center gap-2">
                            <MailCheck className="w-8 h-8 text-purple-600" />
                            <span className="text-sm font-semibold">Kampanya E-postaları</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <BellPlus className="w-8 h-8 text-purple-600" />
                            <span className="text-sm font-semibold">Uygulama İçi Bildirimler</span>
                        </div>
                    </div>
                    <p>
                        bana platformda yer alan erken rezervasyon fırsatları, kampanyalı Mescid-i Aksa ve Kudüs indirimleri ile umre haberlerinin SMS ve E-posta yoluyla "Ticari Elektronik İleti" olarak gönderilmesine, bahsi geçen verilerimin pazarlama amacıyla işlenmesine <strong>özgür irademle, açıkça ONAY VERİYORUM.</strong>
                    </p>
                </div>

                <h2>İptal Hakkı</h2>
                <p>
                    Açık Rıza Metnine onay vermiş olan kullanıcı, hiçbir gerekçe göstermeksizin, dilediği vakitte ticari elektronik ileti gönderimini reddetme (kendi sistem ayarlarından e-bülten üyeliğinden veya SMS aboneliğinden çıkma) hakkına mutlak surette sahiptir. Size gönderilen e-postaların en alt kısmında yer alan "Abonelikten Çık" linkine tıklamanız yeterlidir.
                </p>
            </div>
        </div>
    );
}
