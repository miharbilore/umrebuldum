import { Metadata } from "next";
import { Cookie, Settings2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Çerez Politikası | Umrebuldum",
    description: "Sitemizde kullanılan çerezler, kullanım amaçları ve yönetimi hakkında bilgilendirme.",
};

export default function CookiesPolicyPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                    <Cookie className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Çerez (Cookie) Politikası
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Kullanıcı deneyiminizi geliştirmek için kullandığımız takip teknolojileri ve kontrol haklarınız.
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                    Umrebuldum olarak ziyaretçilerimizin sitemizdeki navigasyon deneyimlerini sorunsuz sağlamak
                    ve optimize etmek amacıyla bilgisayarınızda veya cihazınızda (telefon, tablet) "çerez" adı verilen ufak metin dosyaları tutmaktayız.
                </p>

                <h2>Çerez ("Cookie") Nedir?</h2>
                <p>
                    Çerezler (Cookies), web sayfalarımızı ilk defa ziyaret ettiğinizde tarayıcınız (Chrome, Safari vb.) üzerinden cihazlarınıza depolanan kısa bilgiler veren, .txt formatındaki kod parçacıklarıdır. Amacı, o web sayfasına tekrar geldiğinizde cihazınızı tanıması (örneğin: oturumu açık tutması) ve önceki tercihlerinize uymanızı sağlamasıdır (Koyu/Açık tema, son bakılan şehirler vb.).
                </p>

                <h2>Sitemizde Kullanılan Çerez Türleri</h2>
                <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
                    <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-2xl bg-white dark:bg-gray-900">
                        <Settings2 className="w-6 h-6 text-orange-500 mb-2" />
                        <h4 className="font-bold text-lg mb-1">Zorunlu ve Teknik Çerezler</h4>
                        <p className="text-sm text-muted-foreground">Web sitemizin temellerinin eksiksiz ve güvenli bir şekilde çalışabilmesi adına tutulması zorunlu olan ve reddedilmeyen oturum (session) kimlikleridir.</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-2xl bg-white dark:bg-gray-900">
                        <Settings2 className="w-6 h-6 text-orange-500 mb-2" />
                        <h4 className="font-bold text-lg mb-1">Analiz ve Performans Çerezleri</h4>
                        <p className="text-sm text-muted-foreground">Kullanıcıların sitemizi nasıl kullandığını, hangi bağlantılara tıkladığını Anonim olarak ölçerek hataları (404 sayfaları vb.) tespit ettiğimiz 3. taraf (örn. Google Analytics) çerezleridir.</p>
                    </div>
                </div>

                <h2>Kişisel Tercihlerin Yönetimi / Çerezleri Engelleme</h2>
                <p>
                    Herhangi bir nedenle bilgisayarınızda veya cep telefonunuzda "Zorunlu" olmayan çerezleri
                    barındırmak istemiyorsanız, bunu kullandığınız tarayıcının Gizlilik ayarları menüsünden tamamen veya
                    belirli siteler nezdinde engelleyebilirsiniz.
                </p>
                <ul>
                    <li><strong>Google Chrome:</strong> "Ayarlar &gt; Gizlilik ve güvenlik &gt; Üçüncü taraf çerezleri" menüsünden çerezleri engelleyebilirsiniz.</li>
                    <li><strong>Safari:</strong> "Tercihler &gt; Gizlilik" ekranından internet sitelerini takip etmeme yönergelerini etkinleştirebilirsiniz.</li>
                    <li><strong>Mozilla Firefox:</strong> "Seçenekler &gt; Gizlilik ve Güvenlik" adlı panelden engelleme kurabilirsiniz.</li>
                </ul>

                <p className="text-sm text-muted-foreground italic mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
                    Lütfen "Zorunlu/Teknik Çerezler"i tarayıcınızdan kapattığınız durumda; Hesabınıza üye girişi yapamayacağınızı veya oturumunuzun saniyesinde iptal edileceğini göz önünde bulundurunuz. Umre platformumuz teknik oturumlar olmadan tam işlevsellikle çalışamaz.
                </p>
            </div>
        </div>
    );
}
