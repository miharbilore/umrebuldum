import { prisma } from "@/lib/prisma";
import { Check, Star, Zap, Shield, Crown, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
    // Veritabanından aktif paketleri çek (aylık olanları önceliklendir)
    const dbPackages = await prisma.creditPackage.findMany({
        where: { billingPeriod: 1 },
        orderBy: { sortOrder: 'asc' }
    });

    const getIcon = (slug: string) => {
        switch (slug) {
            case 'PRO': return <Crown className="w-8 h-8 text-[#FFB800] fill-[#FFB800]" width={32} height={32} />;
            case 'PLUS': return <Zap className="w-8 h-8 text-blue-500 fill-blue-500" width={32} height={32} />;
            case 'PREMIUM': return <Rocket className="w-8 h-8 text-slate-900" width={32} height={32} />;
            default: return <Shield className="w-8 h-8 text-slate-400" width={32} height={32} />;
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50/50 pb-20">
                <div className="container mx-auto py-16 px-4">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <Star className="w-3 h-3 fill-[#FFB800]" width={12} height={12} />
                            Ayrıcalıklı Paketler
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                            İşinizi Bir Üst <br /> <span className="text-[#FFB800]">Seviyeye Taşıyın</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-2xl mx-auto text-balance">
                            Görünürlüğünüzü artırın, daha fazla umre yolcusuna ulaşın ve profesyonel araçlarla işinizi profesyonelce yönetin.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                        {dbPackages.map((pkg, index) => {
                            const isPopular = pkg.slug === "PRO" || pkg.slug === "PLUS";
                            const features = pkg.features as any || {};

                            return (
                                <div 
                                    key={pkg.id} 
                                    className={cn(
                                        "relative flex flex-col p-10 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white",
                                        isPopular 
                                        ? "ring-4 ring-[#FFB800] shadow-xl" 
                                        : "border border-slate-100 shadow-sm"
                                    )}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFB800] text-black text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg border-2 border-white">
                                            EN ÇOK TERCİH EDİLEN
                                        </div>
                                    )}

                                    <div className="mb-10">
                                        <div className={cn(
                                            "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner transition-colors",
                                            isPopular ? "bg-[#FFB800]/10" : "bg-slate-50"
                                        )}>
                                            {getIcon(pkg.slug)}
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 mb-4">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-slate-900 tracking-tight">₺{pkg.priceTRY.toString()}</span>
                                            <span className="text-base font-black text-slate-400 uppercase tracking-widest">/AY</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-12 flex-1 pt-8 border-t border-slate-50">
                                        <DashboardFeatureItem text={`${pkg.credits} Token Hediye`} included={true} isHighlight={true} />
                                        <DashboardFeatureItem text={`${features.maxListings || 5} Aktif İlan Hakkı`} included={true} />
                                        <DashboardFeatureItem text="Öncelikli Başvuru Listeleme" included={features.priorityRanking} />
                                        <DashboardFeatureItem text="Afiş (Poster) Oluşturucu" included={features.canCreatePoster} />
                                        <DashboardFeatureItem text="Yapay Zeka SEO Desteği" included={features.aiGenerator} />
                                        <DashboardFeatureItem text="7/24 Teknik Destek" included={isPopular} />
                                    </div>

                                    <Button 
                                        asChild
                                        className={cn(
                                            "w-full h-16 rounded-2xl text-base font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 group",
                                            isPopular 
                                            ? "bg-[#FFB800] hover:bg-[#E6A600] text-black shadow-[#FFB800]/20" 
                                            : "bg-slate-900 hover:bg-black text-white shadow-slate-200"
                                        )}
                                    >
                                        <Link href={`/dashboard/checkout?pkgId=${pkg.id}`}>
                                            Hemen Başla
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" width={20} height={20} />
                                        </Link>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-24 text-center">
                        <div className="inline-flex items-center gap-8 px-8 py-4 bg-white rounded-full border border-slate-100 shadow-sm text-[11px] font-black uppercase tracking-widest text-slate-400">
                             <span className="flex items-center gap-2">
                                 <Shield className="w-4 h-4 text-[#059669]" />
                                 256-bit SSL Güvenli Ödeme
                             </span>
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                             <Link href="/terms" className="hover:text-slate-900 transition-colors">
                                 Kullanım ve İptal Koşulları
                             </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function DashboardFeatureItem({ text, included, isHighlight }: { text: string; included: boolean; isHighlight?: boolean }) {
    if (!included) return (
        <div className="flex items-center gap-3 opacity-30 grayscale">
            <X className="w-5 h-5 text-slate-300" width={16} height={16} />
            <span className="text-sm font-bold text-slate-400 line-through decoration-1">{text}</span>
        </div>
    );

    return (
        <div className="flex items-center gap-3 group">
            <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                isHighlight ? "bg-[#FFB800]/20 border-[#FFB800]/30 text-[#FFB800]" : "bg-emerald-50 border-emerald-100 text-[#059669]"
            )}>
                <Check className="w-3.5 h-3.5" strokeWidth={4} width={14} height={14} />
            </div>
            <span className={cn(
                "text-sm font-black transition-colors",
                isHighlight ? "text-slate-900 underline decoration-[#FFB800]/30 decoration-2 underline-offset-4" : "text-slate-600 group-hover:text-slate-900"
            )}>{text}</span>
        </div>
    );
}

function X({ className, ...props }: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
