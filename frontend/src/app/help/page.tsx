import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, FileText, PhoneCall, Mail, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Yardım Merkezi | Umrebuldum",
        description: "Umrebuldum Yardım Merkezi. Platform kullanımı, turlar, acenteler ve teknik konularda destek alın.",
    };
}

export default function HelpCenterPage() {
    return (
        <div className="container py-16 md:py-24 max-w-5xl mx-auto space-y-16">
            {/* Header */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Yardım Merkezi
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Umrebuldum'da aradığınızı kolayca bulabilmeniz ve sistemimizi kusursuz kullanabilmeniz için kapsamlı rehberlerimizi inceleyin.
                </p>
            </div>

            {/* Quick Categories */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/faq" className="group rounded-2xl border bg-card p-8 hover:shadow-lg transition-all duration-200">
                    <BookOpen className="w-10 h-10 text-emerald-600 mb-5 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">Sık Sorulan Sorular</h3>
                    <p className="text-muted-foreground mb-4">Vize, konaklama, iptal ve temel tur işleyişi hakkında genel sorular.</p>
                    <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Cevapları Oku &rarr;
                    </span>
                </Link>

                <Link href="/terms" className="group rounded-2xl border bg-card p-8 hover:shadow-lg transition-all duration-200">
                    <FileText className="w-10 h-10 text-emerald-600 mb-5 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">Kullanım Koşulları</h3>
                    <p className="text-muted-foreground mb-4">Platformun kuralları, yükümlülükler ve hizmet tanım detayları.</p>
                    <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Koşulları İncele &rarr;
                    </span>
                </Link>

                <Link href="/refund-policy" className="group rounded-2xl border bg-card p-8 hover:shadow-lg transition-all duration-200">
                    <ShieldCheck className="w-10 h-10 text-emerald-600 mb-5 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">İptal & İade</h3>
                    <p className="text-muted-foreground mb-4">Tur iptallerindeki süreçler, no-show durumları ve cayma hakkı.</p>
                    <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Politikayı Gör &rarr;
                    </span>
                </Link>
            </div>

            {/* Content Body */}
            <div className="prose prose-gray dark:prose-invert max-w-none bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 md:p-12 rounded-3xl">
                <h2 className="text-3xl font-bold mt-0">Platform Nasıl Çalışır?</h2>
                <div className="grid md:grid-cols-2 gap-10 mt-8 not-prose">
                    <div className="space-y-4">
                        <div className="flex bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Karşılaştırma Yapın</h4>
                                <p className="text-sm text-muted-foreground">Şehir, bütçe, yıldız veya tarih kriterlerinizi girerek onlarca acentenin en güncel turlarını aynı anda tek bir sayfada görüntüleyin.</p>
                            </div>
                        </div>
                        <div className="flex bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Detayları İnceleyin</h4>
                                <p className="text-sm text-muted-foreground">İlgilendiğiniz turun gidiş-dönüş lokasyonunu, otellerin Kabe'ye/Mescid-i Nebevi'ye uzaklıklarını ve ekstra hizmetlerini inceleyin.</p>
                            </div>
                        </div>
                        <div className="flex bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Acenteyle Görüşün</h4>
                                <p className="text-sm text-muted-foreground">Komisyon veya ara ücret ödemeden tur sayfasındaki "Teklif Al" butonu ile doğrudan resmi makamlarla iletişime veya ödemeye geçin.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-6">
                        <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                            <h4 className="font-bold text-lg mb-2">Acenteler (Kurumsal) İçin</h4>
                            <p className="text-sm text-muted-foreground mb-4">Umrebuldum'da kurumsal bir mağaza açarak turlarınızı milyonlarca potansiyel ziyaretçiye ulaştırın.</p>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/listing-terms">İlan Verme Şartları</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Direct Contact Footer */}
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Özel Bir Sorununuz Mu Var?</h2>
                <p className="text-muted-foreground">Destek ekibimize ulaşarak anında çözüm sağlayabilirsiniz.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                        <a href="tel:+908501234567"><PhoneCall className="mr-2" /> 0850 123 45 67</a>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base" asChild>
                        <a href="mailto:destek@umrebuldum.com"><Mail className="mr-2" /> destek@umrebuldum.com</a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
