import { Metadata } from "next";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircleQuestion, CreditCard, PlaneTakeoff, ShieldAlert } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Sık Sorulan Sorular | Umrebuldum",
        description: "Umre turları, rezervasyon süreçleri, vize işlemleri ve ödeme seçenekleri hakkında merak ettiğiniz tüm soruların profesyonel cevapları.",
    };
}

export default function FAQPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <MessageCircleQuestion className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Sık Sorulan Sorular
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Aklınıza takılan soruların cevaplarını burada bulabilirsiniz. Konularına göre ayrılmış rehberimizi inceleyin.
                </p>
            </div>

            <div className="grid gap-10">
                {/* Genel Sorular */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <PlaneTakeoff className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-2xl font-semibold">Turlar ve Rezervasyon</h2>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b-0 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-6">
                            <AccordionTrigger className="hover:no-underline font-medium text-lg py-5">Umrebuldum üzerinden nasıl rezervasyon yapabilirim?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                                Umrebuldum, Türkiye'nin en seçkin ve TÜRSAB onaylı acentelerini bir araya getiren bağımsız bir pazar yeridir. Beğendiğiniz turun detay sayfasından doğrudan acente ile iletişime geçerek rezervasyon ve ödeme işlemlerinizi yürütebilirsiniz. Platformumuz doğrudan ödeme almamakta, sizi en doğru hizmet sağlayıcıyla şeffaf bir şekilde buluşturmaktadır.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-b-0 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-6">
                            <AccordionTrigger className="hover:no-underline font-medium text-lg py-5">Umre vizemi nasıl alabilirim?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                                Mevzuat gereği Umre vizesi işlemleri, rezervasyon yaptığınız Diyanet İşleri Başkanlığı ve TÜRSAB yetkili acenteleri tarafından yürütülmektedir. Pasaportunuzu ve gerekli evrakları (biyometrik fotoğraf vb.) acenteye teslim etmeniz halinde tüm konsolosluk ve vize süreçleri onlar tarafından sizin adınıza profesyonelce tamamlanır.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-b-0 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-6">
                            <AccordionTrigger className="hover:no-underline font-medium text-lg py-5">Turlara temel olarak neler dahildir?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                                İlanlarda aksi belirtilmediği sürece standart umre paketlerine; gidiş-dönüş uçak biletleri, Mekke ve Medine konaklamaları, vize işlemleri, havalimanı-otel arası VIP/otobüs transferleri, Türkçe rehberlik hizmeti, Diyanet kartı ve temel seyahat sağlık sigortası dahildir. Ekstra yemek (yarım pansiyon/tam pansiyon) durumları turun ilan sayfasında şeffafça listelenir.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Ödeme / İptal */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4 mt-4">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-2xl font-semibold">Ödeme ve İade</h2>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-4" className="border-b-0 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-6">
                            <AccordionTrigger className="hover:no-underline font-medium text-lg py-5">Ödeme seçenekleri ve taksit imkanları nelerdir?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                                Acenteler genellikle kredi kartı ile taksitli ödeme veya banka havalesi seçeneği sunar. Ayrıca çoğu acente, tur tarihinden aylar önce yapılan erken rezervasyonlarda "ön ödeme ile yer ayırtma" ve kalan tutarı tura 15 gün kala tamamlama imkanı tanımaktadır.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5" className="border-b-0 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-6">
                            <AccordionTrigger className="hover:no-underline font-medium text-lg py-5">Rezervasyon iptal koşulları nedir?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                                Umrebuldum platformu olarak satın aldığınız veya alacağınız tur paketleri ile organik bir bağımız bulunmamaktadır. Dolayısıyla iptal ve iade süreçleri tamamen rezervasyon yaptırdığınız yetkili acente veya rehberin insiyatifine ve aranızdaki sözleşme şartlarına tabidir. İptal taleplerinizi ve süreçle ilgili güncel No-Show (kesinti) oranlarını doğrudan anlaştığınız acente/rehber ile görüşmeniz gerekmektedir.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Güvenlik */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4 mt-4">
                        <ShieldAlert className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-2xl font-semibold">Güvenilirlik</h2>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-6" className="border-b-0 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-6">
                            <AccordionTrigger className="hover:no-underline font-medium text-lg py-5">Umrebuldum'da listelenen acenteler güvenilir mi?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                                Umrebuldum olarak listelenen turlar, acenteler veya rehberler üzerinde doğrudan bir sorumluluğumuz veya garantörlüğümüz bulunmamaktadır. Sistemimize sadece resmi evraklarını, TÜRSAB ve Diyanet belgelerini beyan etmiş onaylı üyeler dahil edilebilir. İlgilendiğiniz tur, rehber veya acente hakkında karar verirken diğer kullanıcıların yaptığı yorumları inceleyebilir, kendi deneyimlerinizi aktarmak için yorumlarda bulunabilirsiniz. Biz, olası kötü niyetli girişimleri engellemek adına sahip olduğumuz güvenlik puanı algoritmamız ile acenteleri değerlendirip sizlere daha şeffaf bir tercih ortamı sunmayı hedefliyoruz.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-8 text-center mt-12">
                <h3 className="text-2xl font-bold mb-3">Aradığınız cevabı bulamadınız mı?</h3>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Müşteri hizmetleri ekibimiz sizinle ilgilenmekten memnuniyet duyar. Bize ulaşarak tüm süreçler hakkında detaylı bilgi alabilirsiniz.
                </p>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8" asChild>
                    <Link href="/contact">Bize Ulaşın</Link>
                </Button>
            </div>
        </div>
    );
}
