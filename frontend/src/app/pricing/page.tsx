'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Sparkles, Zap, ArrowRight, Shield, Star, Crown } from 'lucide-react';
import { PACKAGE_LIMITS, PACKAGE_PRICING, TOKEN_COSTS } from '@/lib/package-system';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// ── SEO Metadata ──────────────────────────────────────────────────────────
export const metadata = {
    title: 'Paketler ve Fiyatlandırma | UmreBuldum',
    description: 'UmreBuldum PRO ve Premium paketleri ile ilanlarınızı öne çıkarın, daha fazla müşteriye ulaşın. Hemen karşılaştırın.',
};

// ── Package Card Configuration ────────────────────────────────────────────
const CARDS = [
    {
        id: 'FREEMIUM' as const,
        name: 'Başlangıç',
        desc: 'Platformu tanımak isteyen rehberler için',
        icon: Shield,
        popular: false,
        gradient: 'from-slate-50 to-gray-100',
        accent: 'slate',
        cta: 'Ücretsiz Başla',
        ctaStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
    },
    {
        id: 'PRO' as const,
        name: 'Pro',
        desc: 'Büyümek isteyen profesyonel rehberler için',
        icon: Star,
        popular: true,
        gradient: 'from-blue-50 via-indigo-50 to-violet-50',
        accent: 'blue',
        cta: 'Pro\'ya Geç',
        ctaStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25',
    },
    {
        id: 'PREMIUM' as const,
        name: 'Premium',
        desc: 'Yüksek hacimli ve kurumsal rehberler için',
        icon: Crown,
        popular: false,
        gradient: 'from-amber-50 via-orange-50 to-yellow-50',
        accent: 'amber',
        cta: 'Premium\'a Geç',
        ctaStyle: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25',
    },
];

// ── Feature Comparison Table Data ─────────────────────────────────────────
type FeatureValue = string | boolean;
interface ComparisonRow {
    label: string;
    free: FeatureValue;
    pro: FeatureValue;
    premium: FeatureValue;
}

const COMPARISON: ComparisonRow[] = [
    { label: 'Aktif İlan Sayısı', free: '1', pro: '5', premium: '15' },
    { label: 'İlan Yayın Süresi', free: '30 Gün', pro: '90 Gün', premium: '180 Gün' },
    { label: 'Aylık Yenilenen Jeton', free: 'Yok', pro: '150', premium: '300' },
    { label: 'Başlangıç Jetonu', free: '15', pro: '150', premium: '300' },
    { label: 'Ek Jeton Satın Alma', free: false, pro: true, premium: true },
    { label: 'Günlük Teklif Limiti', free: '1', pro: '10', premium: '20' },
    { label: 'Telefon Numarası Görünürlüğü', free: false, pro: true, premium: true },
    { label: 'Öne Çıkarma (Boost)', free: false, pro: true, premium: true },
    { label: 'Spotlight (VIP Yerleşim)', free: false, pro: true, premium: true },
    { label: 'Öncelikli Sıralama', free: false, pro: true, premium: true },
    { label: 'AI ile İlan Yazımı', free: false, pro: false, premium: true },
    { label: 'Güven Puanı Artırıcı', free: false, pro: false, premium: true },
    { label: 'Afiş/Poster Oluşturma', free: false, pro: true, premium: true },
    { label: 'Poster Kalitesi', free: 'Düşük', pro: 'Normal', premium: 'Yüksek' },
    { label: 'Filigran (Watermark)', free: 'Var', pro: 'Yok', premium: 'Yok' },
];

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <div className="min-h-screen bg-[#fafbfc] flex flex-col">
            <Header />

            <main className="flex-1">
                {/* ── Hero ─────────────────────────────────────────── */}
                <section className="pt-24 pb-8 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-100">
                            <Zap className="w-4 h-4 fill-blue-600" />
                            Her İşlem = 5 Jeton
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-5 leading-tight">
                            Doğru Paket ile{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                İşinizi Büyütün
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                            İlan oluşturma ve teklif gönderme sadece <strong className="text-gray-900">5 jeton</strong>.
                            FREEMIUM ile başlayın, ihtiyacınız arttıkça yükseltin.
                        </p>

                        {/* Billing Toggle */}
                        <div className="inline-flex items-center bg-white rounded-full p-1.5 border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${!isAnnual ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Aylık
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 relative ${isAnnual ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Yıllık
                                <span className="absolute -top-2.5 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    %14 İndirim
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Pricing Cards ────────────────────────────────── */}
                <section className="py-12 px-4">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                        {CARDS.map((card) => {
                            const limits = PACKAGE_LIMITS[card.id as keyof typeof PACKAGE_LIMITS];
                            const pricing = card.id !== 'FREEMIUM'
                                ? PACKAGE_PRICING[card.id as keyof typeof PACKAGE_PRICING]
                                : null;

                            const monthlyPrice = pricing?.defaultPrice ?? 0;
                            const displayPrice = isAnnual
                                ? Math.round(monthlyPrice * 12 * 0.86)
                                : monthlyPrice;
                            const strikePrice = pricing?.strikethroughPrice ?? 0;
                            const displayStrike = isAnnual
                                ? Math.round(strikePrice * 12 * 0.86)
                                : strikePrice;

                            const IconComponent = card.icon;

                            return (
                                <div
                                    key={card.id}
                                    id={`pricing-card-${card.id.toLowerCase()}`}
                                    className={`
                                        relative rounded-3xl p-8 flex flex-col
                                        bg-gradient-to-br ${card.gradient}
                                        border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                        ${card.popular
                                            ? 'border-blue-300 shadow-xl shadow-blue-100/50 ring-2 ring-blue-500/20 scale-[1.02] z-10'
                                            : 'border-gray-200/80 shadow-sm'
                                        }
                                    `}
                                >
                                    {/* Popular Badge */}
                                    {card.popular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-full flex items-center gap-1.5 shadow-lg shadow-blue-500/30">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                En Popüler
                                            </div>
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                card.popular ? 'bg-blue-100 text-blue-600' :
                                                card.id === 'PREMIUM' ? 'bg-amber-100 text-amber-600' :
                                                'bg-gray-200 text-gray-600'
                                            }`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900">{card.name}</h3>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        {monthlyPrice > 0 ? (
                                            <div>
                                                {/* Strikethrough (old price) */}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base text-gray-400 line-through font-medium">
                                                        ₺{displayStrike.toLocaleString('tr-TR')}
                                                    </span>
                                                    <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                                                        TASARRUF
                                                    </span>
                                                </div>
                                                {/* Active price (big & bold) */}
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                                        ₺{displayPrice.toLocaleString('tr-TR')}
                                                    </span>
                                                    <span className="text-gray-400 font-medium text-sm">
                                                        {isAnnual ? '/ yıl' : '/ ay'}
                                                    </span>
                                                </div>
                                                {isAnnual && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Aylık ₺{Math.round(displayPrice / 12).toLocaleString('tr-TR')}&#39;ye denk gelir
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">₺0</span>
                                                <span className="text-gray-400 font-medium text-sm ml-1">/ sonsuza dek</span>
                                                <p className="text-xs text-gray-400 mt-1">Kredi kartı gerektirmez</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Token Badge */}
                                    <div className={`rounded-xl px-4 py-3 mb-6 flex items-center justify-between ${
                                        card.popular ? 'bg-blue-100/60 border border-blue-200/50' :
                                        card.id === 'PREMIUM' ? 'bg-amber-100/60 border border-amber-200/50' :
                                        'bg-gray-200/60 border border-gray-300/50'
                                    }`}>
                                        <span className="text-sm font-semibold text-gray-700">Aylık Jeton:</span>
                                        <span className="text-base font-bold flex items-center gap-1.5">
                                            <Zap className={`w-4 h-4 ${
                                                card.popular ? 'text-blue-500 fill-blue-500' :
                                                card.id === 'PREMIUM' ? 'text-amber-500 fill-amber-500' :
                                                'text-gray-400 fill-gray-400'
                                            }`} />
                                            {limits.monthlyTokens > 0 ? limits.monthlyTokens : `${limits.initialTokens} (Tek Seferlik)`}
                                        </span>
                                    </div>

                                    {/* Key Features */}
                                    <ul className="flex-1 space-y-3 mb-8">
                                        <li className="flex items-center gap-3">
                                            <Check className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                            <span className="text-gray-600 text-sm">
                                                <strong className="text-gray-900">{limits.maxListings}</strong> Aktif İlan
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Check className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                            <span className="text-gray-600 text-sm">
                                                <strong className="text-gray-900">{limits.maxDailyOffers}</strong> Günlük Teklif
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            {card.id === 'FREEMIUM' ? (
                                                <X className="w-4.5 h-4.5 text-red-400 shrink-0" />
                                            ) : (
                                                <Check className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                            )}
                                            <span className={`text-sm ${card.id === 'FREEMIUM' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Ek Jeton Satın Alma
                                            </span>
                                        </li>
                                        {limits.phoneVisible && (
                                            <li className="flex items-center gap-3">
                                                <Check className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                                <span className="text-gray-600 text-sm">Telefon Görünürlüğü</span>
                                            </li>
                                        )}
                                        {limits.spotlightEligible && (
                                            <li className="flex items-center gap-3">
                                                <Check className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                                <span className="text-gray-600 text-sm">Spotlight &amp; Boost</span>
                                            </li>
                                        )}
                                        {limits.aiGenerator && (
                                            <li className="flex items-center gap-3">
                                                <Check className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                                <span className="text-gray-600 text-sm">
                                                    AI İlan Asistanı
                                                    <span className="ml-1.5 text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 font-bold rounded">YENİ</span>
                                                </span>
                                            </li>
                                        )}
                                    </ul>

                                    {/* CTA */}
                                    <Button
                                        asChild
                                        className={`w-full py-6 text-base font-bold rounded-xl transition-all duration-200 ${card.ctaStyle}`}
                                    >
                                        <Link href={card.id === 'FREEMIUM' ? '/auth/register' : '/dashboard/billing'}>
                                            {card.cta}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Token Math Explainer ─────────────────────────── */}
                <section className="py-12 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                                Jeton Nasıl Çalışır?
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { action: 'İlan Oluşturma', cost: TOKEN_COSTS.LISTING_CREATE },
                                    { action: 'Teklif Gönderme', cost: TOKEN_COSTS.OFFER_SEND },
                                    { action: 'Talep Kilidi Açma', cost: TOKEN_COSTS.DEMAND_UNLOCK },
                                    { action: 'Genel Boost', cost: TOKEN_COSTS.BOOST },
                                    { action: 'Spotlight (VIP)', cost: TOKEN_COSTS.SPOTLIGHT },
                                    { action: 'Yeniden Yayınlama', cost: TOKEN_COSTS.REPUBLISH },
                                ].map((item) => (
                                    <div key={item.action} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        <span className="text-sm text-gray-600">{item.action}</span>
                                        <span className="inline-flex items-center gap-1 font-bold text-sm text-gray-900">
                                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            {item.cost}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Feature Comparison Table ─────────────────────── */}
                <section className="py-12 px-4 pb-24">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-10">
                            Detaylı Özellik Karşılaştırması
                        </h2>

                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            {/* Table Header */}
                            <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50/80">
                                <div className="p-4 text-sm font-semibold text-gray-500">Özellik</div>
                                <div className="p-4 text-center text-sm font-semibold text-gray-500">Başlangıç</div>
                                <div className="p-4 text-center text-sm font-bold text-blue-600 bg-blue-50/50">Pro</div>
                                <div className="p-4 text-center text-sm font-bold text-amber-600 bg-amber-50/50">Premium</div>
                            </div>

                            {/* Table Body */}
                            {COMPARISON.map((row, i) => (
                                <div
                                    key={row.label}
                                    className={`grid grid-cols-4 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                                >
                                    <div className="p-4 text-sm text-gray-700 font-medium flex items-center">
                                        {row.label}
                                    </div>
                                    {(['free', 'pro', 'premium'] as const).map((tier) => {
                                        const val = row[tier];
                                        const bgClass = tier === 'pro' ? 'bg-blue-50/30' : tier === 'premium' ? 'bg-amber-50/30' : '';
                                        return (
                                            <div key={tier} className={`p-4 text-center flex items-center justify-center ${bgClass}`}>
                                                {typeof val === 'boolean' ? (
                                                    val ? (
                                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                                                            <X className="w-3.5 h-3.5 text-red-400" />
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {val}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="text-center mt-10">
                            <p className="text-gray-500 mb-4">
                                Hangi paketi seçeceğinize karar veremiyorsanız, <strong>FREEMIUM</strong> ile başlayın.
                                İstediğiniz zaman yükseltebilirsiniz.
                            </p>
                            <Button
                                asChild
                                className="bg-gray-900 hover:bg-black text-white px-8 py-4 text-base font-bold rounded-xl"
                            >
                                <Link href="/auth/register">
                                    Hemen Ücretsiz Başla
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
