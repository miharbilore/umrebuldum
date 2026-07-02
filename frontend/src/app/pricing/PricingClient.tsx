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

type BillingPeriod = 1 | 3 | 12;

const SLUG_METADATA: Record<string, any> = {
    FREEMIUM: { icon: Users, color: 'gray', desc: 'Sistemi tanımak isteyenler için tamamen ücretsiz başlangıç paketi.' },
    PREMIUM: { icon: Star, color: 'blue', desc: 'Profesyonel rehberler için en ideal standart paket.' },
    PRO: { icon: Rocket, color: 'emerald', desc: 'Yüksek hacimli rehberlik hizmetleri için tam donanımlı paket.', popular: true },
    BUSINESS: { icon: Building2, color: 'indigo', desc: 'Acenteler ve kurumsal yapılar için kapsamlı çözüm.' },
};

const DEFAULT_METADATA = { icon: Package, color: 'slate', desc: 'Özel üyelik avantajları.' };

const FAQS = [
    {
        q: 'Paketimi dilediğim zaman değiştirebilir miyim?',
        a: 'Evet, dilediğiniz zaman bir üst pakete geçiş yapabilirsiniz. Üst pakete geçişlerde mevcut krediniz korunur. Alt pakete geçişlerde ise mevcut döneminizin bitmesi gerekir.'
    },
    {
        q: 'Tokenlar ne işe yarar?',
        a: 'Tokenlar; yeni ilan yayınlama, ilan sürelerini uzatma, vitrin ilanı alma veya müşterilere doğrudan teklif verme işlemlerinde kullanılan platform para birimidir.'
    },
    {
        q: 'Business paketin avantajı nedir?',
        a: 'Business paketler, birden fazla rehberle çalışan acenteler için yüksek ilan limiti ve gelişmiş raporlama özellikleri sunar.'
    },
    {
        q: 'Ödemeler güvenli mi?',
        a: 'Tüm ödemeleriniz BRSA onaylı ödeme kuruluşları (iyzico/Stripe) üzerinden 256-bit SSL sertifikası ile korunarak gerçekleştirilir. Kart bilgileriniz asla sisteme kaydedilmez.'
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
    features: {
        maxListings?: number;
        listingDays?: number;
        maxBoosts?: number;
        phoneVisible?: boolean;
        canCreatePoster?: boolean;
        priorityRanking?: boolean;
        [key: string]: unknown;
    };
}

export default function PricingClient() {
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

    const displayPackages = packages.filter(p => p.slug === 'FREEMIUM' || p.billingPeriod === billingPeriod);
    const uniqueSlugs = Array.from(new Set(displayPackages.map(p => p.slug)));
    const filteredPackages = uniqueSlugs.map(slug => displayPackages.find(p => p.slug === slug)!);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32 px-4 shadow-sm border-b border-slate-100">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-10">
                         <div className="absolute top-10 left-10 w-64 h-64 bg-[#FFB800] rounded-full blur-3xl"></div>
                         <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative max-w-5xl mx-auto text-center">
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-[#059669] uppercase bg-emerald-50 rounded-full border border-emerald-100">
                             Paketler ve Üyelik
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            İşinizi Büyütecek <br /> 
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-[#FFB800]">En Doğru Paketi Seçin</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium">
                            Aylık binlerce potansiyel umreciye ulaşın. Şeffaf fiyatlandırma, zengin özellikler ve sonuç odaklı altyapı ile fark yaratın.
                        </p>

                        {/* Billing Switcher */}
                        <div className="relative inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                            {[1, 3, 12].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setBillingPeriod(p)}
                                    className={cn(
                                        "px-8 py-3 rounded-xl text-sm font-bold transition-all relative min-h-[44px]",
                                        billingPeriod === p ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    {p === 1 ? 'Aylık' : p === 3 ? '3 Aylık' : 'Yıllık'}
                                    {p === 12 && (
                                        <span className="absolute -top-3 -right-3 px-2 py-0.5 text-[10px] bg-[#059669] text-white rounded-full font-black shadow-sm">
                                            %14 İndirim
                                        </span>
                                    )}
                                    {p === 3 && (
                                        <span className="absolute -top-3 -right-3 px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded-full font-black shadow-sm">
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
                                <div key={i} className="animate-pulse bg-slate-200 h-[500px] rounded-[2.5rem]" />
                            ))
                        ) : filteredPackages.map((pkg) => {
                            const meta = SLUG_METADATA[pkg.slug] || DEFAULT_METADATA;
                            const Icon = meta.icon;
                            
                            const userRole = session?.user?.role;
                            const isRoleMismatch = (userRole === 'GUIDE' && pkg.roleTarget === 'ORGANIZATION') ||
                                                 (userRole === 'ORGANIZATION' && pkg.roleTarget === 'GUIDE');
                            
                            const roleText = pkg.roleTarget === 'ORGANIZATION' ? 'Sadece Business' : 'Sadece Rehberler';

                            return (
                                <div key={pkg.id} className={cn(
                                    "relative flex flex-col bg-white rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group",
                                    meta.popular ? "ring-4 ring-[#FFB800] shadow-xl" : "border border-slate-200 shadow-sm",
                                    isRoleMismatch && "opacity-80 grayscale-[0.3]"
                                )}>
                                    {meta.popular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFB800] text-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-1.5 border-4 border-white">
                                            <Star className="w-3.5 h-3.5 fill-black" width={14} height={14} /> En Popüler Seçim
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors",
                                            meta.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100" :
                                            meta.color === 'emerald' ? "bg-emerald-50 text-[#059669] group-hover:bg-emerald-100" :
                                            meta.color === 'indigo' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100" : 
                                            meta.color === 'amber' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100" : "bg-slate-50 text-slate-600"
                                        )}>
                                            <Icon className="w-8 h-8" width={32} height={32} />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-2xl font-black text-slate-900 leading-none">{pkg.name}</h3>
                                            {pkg.roleTarget === 'ORGANIZATION' && (
                                                <Building2 className="w-4 h-4 text-slate-400" width={16} height={16} title="Business Paket" />
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 h-10 font-medium">
                                            {meta.desc}
                                        </p>

                                        <div className="mt-8">
                                            {pkg.priceTRY > 0 ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                                                            ₺{Math.round(pkg.priceTRY / (pkg.billingPeriod || 1)).toLocaleString('tr-TR')}
                                                        </span>
                                                        <span className="text-slate-500 font-bold">
                                                            / ay
                                                        </span>
                                                    </div>
                                                    {pkg.billingPeriod > 1 && (
                                                        <span className="text-[12px] font-black text-[#059669] mt-2 uppercase tracking-wide bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 w-fit">
                                                            Toplam: ₺{pkg.priceTRY.toLocaleString('tr-TR')} (Avantajlı Fiyat)
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

                                    <div className="flex-1 space-y-4 mb-10 border-t border-slate-100 pt-8">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                                            <Zap className="w-3.5 h-3.5 fill-blue-600" width={14} height={14} /> {pkg.credits} Token Hediye
                                        </div>
                                        {pkg.features && typeof pkg.features === 'object' && !Array.isArray(pkg.features) ? (
                                            <>
                                                <FeatureItem text={`${pkg.features.maxListings || 0} Aktif İlan Hakkı`} />
                                                <FeatureItem text={`${pkg.features.listingDays || 0} Gün İlan Yayını`} />
                                                <FeatureItem text={`${pkg.features.maxBoosts || 0} Aylık Öne Çıkarma`} />
                                                {pkg.features.phoneVisible && <FeatureItem text="Telefon Numarası Gösterimi" />}
                                                {pkg.features.canCreatePoster && <FeatureItem text="Afiş Motoru Erişimi" />}
                                                {pkg.features.priorityRanking && <FeatureItem text="Öncelikli Sıralama Desteği" />}
                                            </>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Özellikler yükleniyor...</p>
                                        )}
                                    </div>

                                    <Button 
                                        asChild 
                                        disabled={isRoleMismatch}
                                        className={cn(
                                            "w-full min-h-[56px] text-base font-black rounded-2xl transition-all shadow-lg active:scale-[0.98] group",
                                            isRoleMismatch 
                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none" 
                                                : meta.popular 
                                                    ? "bg-[#FFB800] hover:bg-[#E6A600] text-black shadow-[#FFB800]/20" 
                                                    : "bg-slate-900 hover:bg-black text-white shadow-slate-200"
                                        )}
                                    >
                                        {isRoleMismatch ? (
                                            <span className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" width={16} height={16} /> {roleText}
                                            </span>
                                        ) : (
                                            <Link href={session ? `/checkout?pkg=${pkg.id}&period=${pkg.billingPeriod || 1}` : "/login"}>
                                                {pkg.slug === 'FREEMIUM' ? 'Şimdi Dene' : 'Hemen Başlat'}
                                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" width={20} height={20} />
                                            </Link>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Alakart Token Section */}
                <div className="bg-white py-24 px-4 border-y border-slate-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 mb-6 transition-all hover:scale-105 shadow-sm">
                                <Zap className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" width={16} height={16} />
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Alakart Tokenler</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">İhtiyacın Kadar Token Al</h2>
                            <p className="text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                                İlanların sürelerini uzatmak veya daha fazla teklif göndermek için dilediğin zaman ek token satın alabilirsin.
                                <br />
                                <span className="text-xs text-[#059669] font-black mt-3 inline-flex items-center gap-1.5 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    <Shield className="w-3 h-3" width={12} height={12} /> Sadece Ücretli Paket Sahiplerine Özel
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {TOKEN_PACKAGES.map((tokenPkg) => {
                                const isFreemium = session?.user?.packageType === 'FREEMIUM';
                                return (
                                    <div key={tokenPkg.id} className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all hover:border-[#FFB800] hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFB800]/5 rounded-bl-full pointer-events-none" />
                                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:bg-[#FFB800]/10 shadow-sm transition-colors border border-slate-100">
                                            <Zap className="w-8 h-8 text-[#FFB800] group-hover:fill-[#FFB800] transition-all" width={32} height={32} />
                                        </div>
                                        <h3 className="font-black text-2xl text-slate-900 mb-1 leading-none">{tokenPkg.tokens} Token</h3>
                                        <div className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-wider">₺{tokenPkg.unitPrice.toFixed(2)} / ADET</div>
                                        
                                        <div className="mt-auto w-full">
                                            <div className="text-3xl font-black text-slate-900 mb-6">₺{tokenPkg.priceTRY.toLocaleString('tr-TR')}</div>
                                            <Button 
                                                asChild 
                                                disabled={isFreemium}
                                                className={cn(
                                                    "w-full min-h-[48px] rounded-2xl font-black text-sm uppercase transition-all shadow-md active:scale-95",
                                                    isFreemium 
                                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none"
                                                        : "bg-slate-900 hover:bg-black text-white"
                                                )}
                                            >
                                                {isFreemium ? (
                                                    <span className="text-[10px] tracking-tight">Paket Gerekli</span>
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
                <div className="bg-slate-50 py-24 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Sıkça Sorulan Sorular</h2>
                            <p className="text-slate-500 font-bold">Paketler, Tokenlar ve Süreçler Hakkında Her Şey.</p>
                        </div>

                        <div className="space-y-4">
                            {FAQS.map((faq, i) => (
                                <div key={i} className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white transition-all hover:border-[#FFB800]/30 shadow-sm focus-within:ring-2 focus-within:ring-[#FFB800]/20">
                                    <button 
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-7 text-left focus:outline-none group"
                                    >
                                        <span className="text-lg font-black text-slate-800 transition-colors group-hover:text-slate-900">{faq.q}</span>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                            openFaq === i ? "bg-[#FFB800] text-black" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                        )}>
                                            {openFaq === i ? <ChevronUp className="w-5 h-5" width={20} height={20} /> : <ChevronDown className="w-5 h-5" width={20} height={20} />}
                                        </div>
                                    </button>
                                    <div className={cn(
                                        "px-7 transition-all duration-500 ease-in-out",
                                        openFaq === i ? "pb-7 max-h-[300px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                                    )}>
                                        <div className="h-px bg-slate-100 mb-6" />
                                        <p className="text-slate-600 leading-relaxed font-bold text-sm">
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
            <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] group-hover:scale-110 transition-transform" width={14} height={14} />
            </div>
            <span className="text-slate-600 text-[14px] font-bold transition-colors group-hover:text-slate-900">
                {text}
            </span>
        </div>
    );
}
