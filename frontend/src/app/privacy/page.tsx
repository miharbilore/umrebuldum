import { Metadata } from "next";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export const metadata: Metadata = {
    title: "Gizlilik Politikası | Umrebuldum",
    description: "Kişisel verilerinizin toplanması, kullanımı ve korunmasına ilişkin Umrebuldum gizlilik taahhüdü.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Gizlilik Politikası
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Kişisel verileriniz bizim için kıymetlidir. Bilgilerinizin güvenliği ve şeffaflık en büyük önceliğimizdir.
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground">Yayın Tarihi: 09 Mart 2026</p>

                <h2>1. Ne Tür Veriler Topluyoruz?</h2>
                <p>Platformumuza üye olurken, soru sorarken veya ilanları incelerken aşağıdaki bilgilerinizi işleyebiliriz:</p>
                <ul>
                    <li><strong>Kimlik ve İletişim:</strong> Ad, Soyad, Telefon, E-Posta adresiniz.</li>
                    <li><strong>Platform İçi Etkileşim:</strong> Beğendiğiniz ilanlar, yaptığınız arama tercihleri ve site içi analizler.</li>
                    <li><strong>Teknik Veriler:</strong> IP adresiniz, cihaz bilgileriniz, çerezler ve gezinme süreniz.</li>
                </ul>

                <h2>2. Verilerin Kullanım Amacı</h2>
                <p>Elde edilen bilgilerinizi yalnızca aşağıdaki amaçlar doğrultusunda kullanıyoruz:</p>
                <div className="grid sm:grid-cols-2 gap-4 not-prose my-6">
                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
                        <span className="text-sm font-medium">Platform güvenliğini sağlama ve dolandırıcılığı önleme</span>
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
                        <span className="text-sm font-medium">Acentelerle "Teklif Al" butonlarındaki eşleşmeleri kurma</span>
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
                        <span className="text-sm font-medium">Sistem hatalarını çözme ve arayüz deneyimini geliştirme</span>
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
                        <span className="text-sm font-medium">Sisteme ve aboneliklerinize ait yasal bildirimleri yapma</span>
                    </div>
                </div>

                <h2>3. Üçüncü Şahıslarla Paylaşım</h2>
                <p>
                    Bilgilerinizi reklam ağlarına, veri brokerlarına KESİNLİKLE satmıyoruz. Bilgileriniz yalnızca:
                </p>
                <ul>
                    <li>Talebinize istinaden ("Teklif İstendi" konumunda iseniz) talebinizi yanıtlayacak ilgili turizm Acentesi'ne aktarılır.</li>
                    <li>Sunucu ve altyapı hizmeti aldığımız global bulut sağlayıcılarında (ör: AWS, Vercel) şifrelenmiş halde barındırılır.</li>
                    <li>Kanuni zorunluluklar sebebiyle ve yetkili yargı makamlarından tebligat gelmesi halinde resmi dairelere bildirilir.</li>
                </ul>

                <h2>4. Veri Güvenliği Önlemleri</h2>
                <p>
                    Şifreleriniz sunucularımızda <strong>Bcrypt</strong> veya benzeri asimetrik algoritmalarla hash'lenmiş olarak ("Tuzlanmış" formatta) tutulur; kurucuların veya veritabanı yöneticilerinin şifrenizi okuması teknik olarak imkansızdır. Tüm sitemiz TLS 1.3/SSL şifreleme alt yapısıyla korunmaktadır.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl mt-8 flex flex-col items-center text-center">
                    <EyeOff className="w-10 h-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-bold mt-0">Silme Hakkınız</h3>
                    <p className="text-sm text-muted-foreground mb-0">Hesabınızı ayarlar bölmesinden dilediğiniz an kalıcı olarak kapatabilir veya info@umrebuldum.com adresine mail atarak "Unutulma Hakkı"nız kapsamında sistemimizdeki tüm dijital izlerinizin yok edilmesini talep edebilirsiniz.</p>
                </div>
            </div>
        </div>
    );
}
