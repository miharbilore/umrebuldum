'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    Check, 
    Zap, 
    Shield, 
    ArrowRight, 
    ChevronDown, 
    ChevronUp,
    Star,
    Building2,
    Users,
    Rocket,
    CheckCircle2,
    Lock,
    Package
} from 'lucide-react';
import { 
    TOKEN_PACKAGES
} from '@/lib/package-system';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

const SLUG_METADATA: Record<string, any> = {
    FREEMIUM: { icon: Users, color: 'gray', desc: 'Sistemi tanımak isteyenler için ücretsiz başlangıç.' },
    PREMIUM: { icon: Star, color: 'blue', desc: 'Profesyonel rehberler için en ideal standart paket.' },
    PLUS: { icon: Zap, color: 'amber', desc: 'Daha fazla ilan ve görünürlük isteyen rehberler için.' },
    PRO: { icon: Rocket, color: 'emerald', desc: 'Yüksek hacimli rehberlik hizmetleri için tam paket.', popular: true },
    BUSINESS: { icon: Building2, color: 'indigo', desc: 'Küçük ve orta ölçekli acenteler için kapsamlı çözüm.' },
    BUSINESS_PLUS: { icon: Shield, color: 'purple', desc: 'Büyük acenteler için limitsiz kurumsal deneyim.' },
};

const DEFAULT_METADATA = { icon: Package, color: 'slate', desc: 'Özel üyelik avantajları.' };

const FAQS = [
    {
        q: 'Paketimi dilediğim zaman değiştirebilir miyim?',
        a: 'Evet, dilediğiniz zaman bir üst pakete geçiş yapabilirsiniz. Alt pakete geçişlerde ise mevcut döneminizin bitmesi gerekir.'
    },
    {
        q: 'Tokenlar ne işe yarar?',
        a: 'Tokenlar; yeni ilan yayınlama, ilan sürelerini uzatma, vitrin ilanı alma veya müşterilere doğrudan teklif verme işlemlerinde kullanılır.'
    },
    {
        q: 'Kurumsal paketin avantajı nedir?',
        a: 'Kurumsal paketler, birden fazla rehberle çalışan acenteler için yüksek ilan limiti ve gelişmiş raporlama özellikleri sunar.'
    },
    {
        q: 'Ödemeler güvenli mi?',
        a: 'Tüm ödemeleriniz BRSA onaylı ödeme kuruluşları (iyzico/Stripe) üzerinden 256-bit SSL sertifikası ile korunarak gerçekleştirilir.'
    }
];

interface RemotePackage {
    id: string;
    slug: string;
    name: string;
    credits: number;
    priceTRY: number;
    billingPeriod: number;
    roleTarget: string;
    features: Record<string, any>;
}

export default function PricingPage() {
    const { data: session } = useSession();
    const [billingPeriod, setBillingPeriod] = useState<number>(12); // Default to Annual (12 months)
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [packages, setPackages] = useState<RemotePackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/packages');
                if (res.ok) {
                    const data = await res.json();
                    setPackages(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    // Filter display variants based on selected period
    // If a package doesn't have a variant for that period, it will be skipped
    // Exception: FREEMIUM (period 1) is always shown
    const displayPackages = packages.filter(p => p.slug === 'FREEMIUM' || p.billingPeriod === billingPeriod);
    
    // De-duplicate slugs to show only the selected period's variant
    const uniqueSlugs = Array.from(new Set(displayPackages.map(p => p.slug)));
    const filteredPackages = uniqueSlugs.map(slug => displayPackages.find(p => p.slug === slug)!);

    const periodLabel = {
        1: '/ ay',
        3: '/ 3 ay',
        12: '/ yıl'
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32 px-4 shadow-sm">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-10">
                         <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"></div>
                         <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative max-w-5xl mx-auto text-center">
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-emerald-700 uppercase bg-emerald-100 rounded-full">
                            Fiyatlandırma & Paketler
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            İşinizi Büyütecek <br /> 
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">En Doğru Paketi Seçin</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
                            Aylık binlerce potansiyel umreciye ulaşın. Şeffaf fiyatlandırma, zengin özellikler ve sonuç odaklı altyapı.
                        </p>

                        {/* Billing Switcher */}
                        <div className="relative inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                            {[1, 3, 12].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setBillingPeriod(p)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative",
                                        billingPeriod === p ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    {p === 1 ? 'Aylık' : p === 3 ? '3 Aylık' : 'Yıllık'}
                                    {p === 12 && (
                                        <span className="absolute -top-3 -right-3 px-2 py-0.5 text-[10px] bg-emerald-500 text-white rounded-full">
                                            %14 İndirim
                                        </span>
                                    )}
                                    {p === 3 && (
                                        <span className="absolute -top-3 -right-3 px-2 py-0.5 text-[10px] bg-blue-500 text-white rounded-full">
                                            %7 İndirim
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="max-w-7xl mx-auto px-4 -mt-16 pb-24 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-slate-200 h-96 rounded-[2.5rem]" />
                            ))
                        ) : filteredPackages.map((pkg) => {
                            const meta = SLUG_METADATA[pkg.slug] || DEFAULT_METADATA;
                            const Icon = meta.icon;
                            
                            // Sorting logic: Guides first, then Org. Within each, by price.
                            // Handled by API, so we just map.

                            // Role checks
                            const userRole = session?.user?.role;
                            const isRoleMismatch = (userRole === 'GUIDE' && pkg.roleTarget === 'ORGANIZATION') ||
                                                 (userRole === 'ORGANIZATION' && pkg.roleTarget === 'GUIDE');
                            
                            const roleText = pkg.roleTarget === 'ORGANIZATION' ? 'Sadece Kurumsal' : 'Sadece Rehberler';

                            return (
                                <div key={pkg.id} className={cn(
                                    "relative flex flex-col bg-white rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
                                    meta.popular ? "ring-4 ring-blue-500 shadow-xl" : "border border-slate-200 shadow-sm",
                                    isRoleMismatch && "opacity-80 grayscale-[0.3]"
                                )}>
                                    {meta.popular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-white" /> En Çok Tercih Edilen
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner",
                                            meta.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                            meta.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                            meta.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : 
                                            meta.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                                        )}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-2xl font-black text-slate-900 leading-none">{pkg.name}</h3>
                                            {pkg.roleTarget === 'ORGANIZATION' && (
                                                <Building2 className="w-4 h-4 text-slate-400" title="Kurumsal Paket" />
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 h-10">
                                            {meta.desc}
                                        </p>

                                        <div className="mt-8">
                                            {pkg.priceTRY > 0 ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                                                            ₺{Math.round(pkg.priceTRY / (pkg.billingPeriod || 1))}
                                                        </span>
                                                        <span className="text-slate-500 font-bold">
                                                            / ay
                                                        </span>
                                                    </div>
                                                    {pkg.billingPeriod > 1 && (
                                                        <span className="text-[13px] font-bold text-emerald-600 mt-1 uppercase tracking-tight bg-emerald-50 px-2 py-0.5 rounded w-fit">
                                                            Toplam: ₺{pkg.priceTRY} (%14 İndirimli)
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-4xl font-black text-slate-900 tracking-tight py-4">
                                                    Ücretsiz
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3.5 mb-10 border-t border-slate-100 pt-8">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2">
                                            <Zap className="w-3.5 h-3.5" /> {pkg.credits} Token Hediye
                                        </div>
                                        {/* Dynamic features from DB if available, else static fallback */}
                                        {pkg.features && typeof pkg.features === 'object' && !Array.isArray(pkg.features) ? (
                                            <>
                                                <FeatureItem text={`${(pkg.features as any).maxListings || 0} Aktif İlan Hakkı`} />
                                                <FeatureItem text={`${(pkg.features as any).listingDays || 0} Gün İlan Süresi`} />
                                                <FeatureItem text={`${(pkg.features as any).maxBoosts || 0} Aylık Boost Hakkı`} />
                                                {(pkg.features as any).phoneVisible && <FeatureItem text="Telefon Numarası Gösterimi" />}
                                                {(pkg.features as any).canCreatePoster && <FeatureItem text="Afiş Motoru Erişimi" />}
                                                {(pkg.features as any).priorityRanking && <FeatureItem text="Öncelikli Sıralama Desteği" />}
                                            </>
                                        ) : (
                                            <p className="text-xs text-slate-400">Özellikler yükleniyor...</p>
                                        )}
                                    </div>

                                    <Button 
                                        asChild 
                                        disabled={isRoleMismatch}
                                        className={cn(
                                            "w-full py-7 text-base font-black rounded-2xl transition-all shadow-md group",
                                            isRoleMismatch 
                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none" 
                                                : meta.popular 
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200" 
                                                    : "bg-slate-900 hover:bg-black text-white"
                                        )}
                                    >
                                        {isRoleMismatch ? (
                                            <span className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" /> {roleText}
                                            </span>
                                        ) : (
                                            <Link href={session ? `/checkout?pkg=${pkg.id}&period=${pkg.billingPeriod || 1}` : "/login"}>
                                                {pkg.slug === 'FREEMIUM' ? 'Şimdi Dene' : 'Hemen Başlat'}
                                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Alakart Token Section */}
                <div className="bg-slate-50 py-24 px-4 border-t border-slate-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 transition-all hover:scale-105">
                                <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                                <span className="text-sm font-black text-blue-700 uppercase tracking-widest">Alakart Menü</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-4">Ek Token Paketleri</h2>
                            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                                İlanlarınızın süresini uzatmak veya daha fazla teklif göndermek için istediğiniz zaman ek token alabilirsiniz.
                                <br />
                                <span className="text-xs text-amber-600 font-bold mt-2 inline-block italic">
                                    * Sadece Premium, Pro ve Kurumsal paket sahipleri ek token satın alabilir.
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {TOKEN_PACKAGES.map((tokenPkg) => {
                                const isFreemium = session?.user?.packageType === 'FREEMIUM';
                                return (
                                    <div key={tokenPkg.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center transition-all hover:border-blue-300 hover:shadow-md group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                                            <Zap className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <h3 className="font-black text-xl text-slate-900 mb-1">{tokenPkg.tokens} Token</h3>
                                        <div className="text-sm font-bold text-slate-400 mb-4 italic">₺{tokenPkg.unitPrice.toFixed(2)} / birim</div>
                                        
                                        <div className="mt-auto w-full">
                                            <div className="text-2xl font-black text-slate-900 mb-4">₺{tokenPkg.priceTRY}</div>
                                            <Button 
                                                asChild 
                                                variant={isFreemium ? "outline" : "default"}
                                                className={cn(
                                                    "w-full rounded-xl font-bold py-6",
                                                    isFreemium 
                                                        ? "border-slate-200 text-slate-400 cursor-not-allowed italic"
                                                        : "bg-slate-900 hover:bg-black text-white"
                                                )}
                                            >
                                                {isFreemium ? (
                                                    <span className="text-xs">Paket Gerekli</span>
                                                ) : (
                                                    <Link href={session ? `/checkout?tokenPkg=${tokenPkg.id}` : "/login"}>
                                                        Satın Al
                                                    </Link>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white py-24 px-4 border-t border-slate-100">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Sıkça Sorulan Sorular</h2>
                            <p className="text-slate-500 font-medium">Paketler ve süreçler hakkında merak ettiğiniz cevaplar.</p>
                        </div>

                        <div className="space-y-4">
                            {FAQS.map((faq, i) => (
                                <div key={i} className="border border-slate-200 rounded-3xl overflow-hidden transition-all hover:border-blue-200 shadow-sm">
                                    <button 
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                    >
                                        <span className="text-lg font-bold text-slate-800">{faq.q}</span>
                                        {openFaq === i ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>
                                    <div className={cn(
                                        "px-6 transition-all duration-300",
                                        openFaq === i ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                                    )}>
                                        <p className="text-slate-600 leading-relaxed font-medium">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3 group">
            <div className="mt-1 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
            </div>
            <span className="text-slate-600 text-[13px] font-medium transition-colors group-hover:text-slate-900">
                {text}
            </span>
        </div>
    );
}
