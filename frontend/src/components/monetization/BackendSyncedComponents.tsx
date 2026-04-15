'use client';

import { useEffect, useState } from 'react';
import { Check, Crown, Zap, AlertCircle } from 'lucide-react';
import { PACKAGE_LIMITS, PLAN_PRICES_TRY } from '@/lib/package-system';

// ======================================
// TYPES
// ======================================

type PackageTier = 'FREEMIUM' | 'PRO' | 'PREMIUM' | 'PLUS' | 'BUSINESS' | 'BUSINESS_PLUS';

interface QuotaData {
    tokenBalance: number;
    packageType: PackageTier;
    daily_limit: number;
    daily_used: number;
    features: {
        can_generate: boolean;
        high_quality: boolean;
    };
}

// ======================================
// PRICING TABLE (Internal Engine Aligned)
// ======================================

interface PricingTableProps {
    currentTier?: PackageTier;
    onUpgrade?: (tier: PackageTier) => void;
}

export function PricingTable({ currentTier = 'FREEMIUM', onUpgrade }: PricingTableProps) {
    const plans = [
        {
            id: 'FREEMIUM' as PackageTier,
            name: 'Ücretsiz',
            price: '₺0',
            description: 'Başlangıç paketi',
            cta: 'Mevcut Plan',
            features: [
                'Günde 1 Teklif Hakkı',
                '1 Aktif İlan Limiti',
                'Standart Sıralama',
                'Temel Profil'
            ],
            popular: false
        },
        {
            id: 'PRO' as PackageTier,
            name: 'PRO',
            price: `₺${PLAN_PRICES_TRY.PRO}/ay`,
            description: 'Bireysel rehberler için',
            cta: "PRO'ya Yükselt",
            features: [
                'Günde 10 Teklif Hakkı',
                '5 Aktif İlan Limiti',
                'Öncelikli Sıralama',
                'Kimlik Doğrulama Rozeti',
                'Spotlight Uygunluğu'
            ],
            popular: true
        },
        {
            id: 'PREMIUM' as PackageTier,
            name: 'PREMIUM',
            price: `₺${PLAN_PRICES_TRY.PREMIUM}/ay`,
            description: 'En kapsamlı paket',
            cta: "PREMIUM'a Yükselt",
            features: [
                'Günde 20 Teklif Hakkı',
                '15 Aktif İlan Limiti',
                'Maksimum Görünürlük',
                'Yüksek Kaliteli Posterler',
                'AI İlan Oluşturucu'
            ],
            popular: false
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
                const isCurrent = currentTier === plan.id;
                const isPopular = plan.popular;

                return (
                    <div
                        key={plan.id}
                        className={`relative rounded-2xl p-6 transition-all duration-200 ${isPopular
                            ? 'bg-white ring-2 ring-purple-600 shadow-xl scale-105'
                            : 'bg-white border border-gray-200 shadow-sm'
                            } ${isCurrent ? 'bg-gray-50' : ''}`}
                    >
                        {isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Zap size={12} fill="currentColor" />
                                    EN POPÜLER
                                </span>
                            </div>
                        )}

                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                            <div className="mt-2 mb-1">
                                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                            </div>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <Check className={`w-5 h-5 flex-shrink-0 ${isPopular ? 'text-purple-600' : 'text-green-600'}`} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => onUpgrade?.(plan.id)}
                            disabled={isCurrent}
                            className={`w-full py-3 rounded-xl font-semibold transition-all ${isCurrent
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : isPopular
                                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
                        >
                            {isCurrent ? 'Mevcut Planınız' : plan.cta}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ======================================
// QUOTA STATUS (Internal API Driven)
// ======================================

export function QuotaStatus() {
    const [quota, setQuota] = useState<QuotaData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user/quota')
            .then(res => res.json())
            .then((data: QuotaData) => {
                setQuota(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Quota Fetch Error:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>;
    if (!quota) return null;

    // Unlimited/Business handling (if applicable)
    if (quota.daily_limit >= 100) {
        return (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <Crown size={20} />
                </div>
                <div>
                    <h4 className="font-semibold text-purple-900">Kurumsal Erişim Aktif</h4>
                    <p className="text-sm text-purple-700">Kotalarınız işletmeniz için genişletildi.</p>
                </div>
            </div>
        );
    }

    // Standard User with Quota
    const percentage = Math.min(100, (quota.daily_used / quota.daily_limit) * 100);
    const isLimitReached = quota.daily_used >= quota.daily_limit;
    console.log("DEBUG QUOTA:", quota);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Günlük Teklif Limiti</span>
                <span className="text-sm font-semibold text-gray-900">
                    {quota.daily_used} / {quota.daily_limit}
                </span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full transition-all duration-500 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {isLimitReached ? (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                    <AlertCircle size={16} />
                    <span>Günlük limit doldu. Yetersiz bakiye veya limit aşımı.</span>
                </div>
            ) : (
                <p className="text-xs text-gray-500">
                    Bugün kalan hakkınız: {quota.daily_limit - quota.daily_used} teklif
                </p>
            )}

            {/* Nuclear Solution: Standalone Quiz CTA for Freemium users with 0 balance */}
            {quota.packageType === 'FREEMIUM' && quota.tokenBalance <= 0 && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex flex-col items-center text-center">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-1">Jetonunuz Bitti! ⚡</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">Hemen rehberlik bilgini kanıtla, tek seferlik 15 jeton ödülünü kap.</p>
                    <a href="/dashboard/quiz" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors">
                        Sınava Gir ve Kazan
                    </a>
                </div>
            )}
        </div>
    );
}

// ======================================
// FEATURE GATE (Server-Synced)
// ======================================

interface FeatureGateProps {
    feature: keyof QuotaData['features'];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function FeatureGate({ feature, fallback = null, children }: FeatureGateProps) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    useEffect(() => {
        // Fetch fresh quota and check features
        fetch('/api/user/quota')
            .then(res => res.json())
            .then((data: QuotaData) => {
                setHasAccess(data.features[feature]);
            })
            .catch(() => setHasAccess(false));
    }, [feature]);

    if (hasAccess === null) return null; // Loading state

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}
