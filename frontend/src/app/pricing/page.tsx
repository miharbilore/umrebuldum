'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Info, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { PACKAGE_LIMITS, PLAN_PRICES_TRY, ANNUAL_DISCOUNT, QUARTERLY_DISCOUNT } from '@/lib/package-system';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

const PACKAGES = [
    {
        id: 'FREEMIUM',
        name: 'Başlangıç',
        desc: 'Sistemi tanımak isteyen rehberler için',
        popular: false,
    },
    {
        id: 'PREMIUM',
        name: 'Premium',
        desc: 'Profesyonel rehberler için standart paket',
        popular: false,
    },
    {
        id: 'PLUS',
        name: 'Plus',
        desc: 'Büyümek isteyen tecrübeli rehberler için',
        popular: true,
    },
    {
        id: 'PRO',
        name: 'Pro',
        desc: 'Tam zamanlı ve yüksek hacimli rehberler',
        popular: false,
    },
    {
        id: 'BUSINESS',
        name: 'Kurumsal',
        desc: 'Küçük ve orta ölçekli acenteler',
        popular: false,
    },
    {
        id: 'BUSINESS_PLUS',
        name: 'Kurumsal Plus',
        desc: 'Türkiye geneli hizmet veren büyük acenteler',
        popular: false,
    }
];

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('ANNUAL');

    const getMultiplier = (period: BillingPeriod) => {
        if (period === 'MONTHLY') return 1;
        if (period === 'QUARTERLY') return 3 * (1 - QUARTERLY_DISCOUNT);
        if (period === 'ANNUAL') return 12 * (1 - ANNUAL_DISCOUNT);
        return 1;
    };

    const periodLabel = {
        MONTHLY: '/ ay',
        QUARTERLY: '/ 3 ay',
        ANNUAL: '/ yıl'
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            
            <main className="flex-1 py-20 px-4">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Size En Uygun <span className="text-blue-600">Paketi Seçin</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        Umrebuldum üzerinden binlerce müşteriye anında ulaşın. Görünürlüğünüzü artırın, satışlarınızı katlayın.
                    </p>

                    <div className="inline-flex bg-gray-200/50 rounded-full p-1.5 border border-gray-200">
                        <button
                            onClick={() => setBillingPeriod('MONTHLY')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingPeriod === 'MONTHLY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Aylık
                        </button>
                        <button
                            onClick={() => setBillingPeriod('QUARTERLY')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingPeriod === 'QUARTERLY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            3 Aylık
                        </button>
                        <button
                            onClick={() => setBillingPeriod('ANNUAL')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all relative ${billingPeriod === 'ANNUAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Yıllık
                            <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                İndirimli
                            </span>
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PACKAGES.map((pkg) => {
                        const baseMonthlyPrice = PLAN_PRICES_TRY[pkg.id as keyof typeof PLAN_PRICES_TRY];
                        const price = Math.round(baseMonthlyPrice * getMultiplier(billingPeriod));
                        const oldPrice = Math.round(price * 1.4); // 40% higher fake previous price
                        const limits = PACKAGE_LIMITS[pkg.id as keyof typeof PACKAGE_LIMITS];

                        return (
                            <div key={pkg.id} className={`bg-white rounded-3xl p-8 relative flex flex-col ${pkg.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105 z-10' : 'border border-gray-200 shadow-sm'}`}>
                                {pkg.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                                        <Sparkles className="w-3.5 h-3.5" /> En Çok Tercih Edilen
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                    <p className="text-gray-500 text-sm h-10">{pkg.desc}</p>
                                    
                                    <div className="mt-6 mb-2">
                                        {price > 0 ? (
                                            <div className="flex items-end gap-2">
                                                <span className="text-lg text-gray-400 line-through font-medium">₺{oldPrice}</span>
                                                <div className="flex items-baseline">
                                                    <span className="text-4xl font-extrabold text-gray-900">₺{price}</span>
                                                    <span className="text-gray-500 ml-2 font-medium">{periodLabel[billingPeriod]}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-4xl font-extrabold text-gray-900">Ücretsiz Başla</span>
                                        )}
                                    </div>
                                    
                                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between mb-8">
                                        <span>Aylık Token Kredisi:</span>
                                        <span className="text-base flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> {limits.monthlyTokens || limits.initialTokens}</span>
                                    </div>
                                </div>

                                <ul className="flex-1 space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-600"><strong className="text-gray-900">{limits.maxListings}</strong> Aktif İlan Hakkı</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-600"><strong className="text-gray-900">{limits.listingDays}</strong> Günlük İlan Süresi</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-600"><strong className="text-gray-900">{limits.maxDailyOffers}</strong> Günlük Teklif Hakkı</span>
                                    </li>
                                    
                                    {limits.phoneVisible && (
                                        <li className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Telefon Numarası Gösterimi</span>
                                        </li>
                                    )}
                                    
                                    {limits.featuredEligible && (
                                        <li className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Vitrin İlanı Alma Uygunluğu</span>
                                        </li>
                                    )}

                                    {limits.canCreatePoster && (
                                        <li className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Otomatik QR Banner Oluşturma <span className="text-[10px] bg-red-100 text-red-600 px-1.5 font-bold rounded">YENİ</span></span>
                                        </li>
                                    )}

                                    {limits.aiGenerator && (
                                        <li className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Yapay Zeka ile İlan Yazımı</span>
                                        </li>
                                    )}
                                </ul>

                                <Button asChild className={`w-full py-6 text-lg font-bold rounded-xl ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-black text-white'}`}>
                                    <Link href="/dashboard">
                                        {pkg.id === 'FREEMIUM' ? 'Hemen Başla' : 'Sisteme Katılın'} <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
}
