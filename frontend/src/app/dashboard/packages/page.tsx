import { prisma } from "@/lib/prisma";
import { Check, Star, Zap, Shield, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
    // Veritabanından aktif paketleri çek (aylık olanları önceliklendir)
    const dbPackages = await prisma.creditPackage.findMany({
        where: { billingPeriod: 1 },
        orderBy: { sortOrder: 'asc' }
    });

    const getIcon = (slug: string) => {
        switch (slug) {
            case 'PRO': return <Crown className="w-6 h-6 text-amber-500" />;
            case 'PLUS': return <Zap className="w-6 h-6 text-blue-500" />;
            case 'PREMIUM': return <Rocket className="w-6 h-6 text-purple-500" />;
            default: return <Shield className="w-6 h-6 text-slate-400" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-12 px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        Gücünüze Güç Katın
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Platformdaki görünürlüğünüzü artırın, daha fazla hacca ve umreye niyetli misafire ulaşın. 
                        İhtiyacınıza en uygun profesyonel planı seçin.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                    {dbPackages.map((pkg, index) => {
                        // Ortadaki paketi veya PRO paketini popüler olarak işaretle
                        const isPopular = pkg.slug === "PRO" || pkg.slug === "PLUS" || index === 1;
                        const features = pkg.features as any || {};

                        return (
                            <div 
                                key={pkg.id} 
                                className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] ${
                                    isPopular 
                                    ? 'bg-neutral-900 text-white shadow-2xl ring-4 ring-amber-400/20' 
                                    : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/50'
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                            EN POPÜLER
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isPopular ? 'bg-white/10' : 'bg-slate-50'}`}>
                                        {getIcon(pkg.slug)}
                                    </div>
                                    <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-slate-900'}`}>{pkg.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">₺{pkg.priceTRY.toString()}</span>
                                        <span className={isPopular ? 'text-slate-400' : 'text-slate-500'}>/ay</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    <FeatureItem text={`${pkg.credits} Token Hediye`} included={true} isDark={isPopular} />
                                    <FeatureItem text={`${features.maxListings || 5} Aktif İlan Hakkı`} included={true} isDark={isPopular} />
                                    <FeatureItem text="Öncelikli Başvuru Listeleme" included={features.priorityRanking} isDark={isPopular} />
                                    <FeatureItem text="Afiş (Poster) Oluşturucu" included={features.canCreatePoster} isDark={isPopular} />
                                    <FeatureItem text="Yapay Zeka SEO Desteği" included={features.aiGenerator} isDark={isPopular} />
                                    <FeatureItem text="7/24 VIP Destek" included={isPopular} isDark={isPopular} />
                                </div>

                                <Button 
                                    asChild
                                    className={`w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-95 ${
                                        isPopular 
                                        ? 'bg-amber-500 hover:bg-amber-400 text-amber-950' 
                                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                                    }`}
                                >
                                    <Link href={`/dashboard/checkout?pkgId=${pkg.id}`}>
                                        Hemen Başla
                                    </Link>
                                </Button>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-20 text-center">
                    <p className="text-slate-500 text-sm">
                        Tüm ödemeler 256-bit SSL sertifikası ile şifrelenmektedir. <br/>
                        İptal ve iade koşulları için <Link href="/terms" className="underline font-medium">Kullanım Koşulları</Link>'nı inceleyin.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}

function FeatureItem({ text, included, isDark }: { text: string; included: boolean; isDark: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${!included && 'opacity-40'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                included 
                ? (isDark ? 'bg-amber-500' : 'bg-emerald-500') 
                : 'bg-slate-300'
            }`}>
                {included ? (
                    <Check className={`w-3.5 h-3.5 ${isDark ? 'text-amber-950' : 'text-white'}`} strokeWidth={4} />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</span>
        </div>
    );
}
