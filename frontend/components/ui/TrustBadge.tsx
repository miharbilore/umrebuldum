'use client';

import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

/**
 * TrustBadge — Displays the unified Trust Score (0-100) as a visual badge.
 *
 * Trust Score System:
 *   - 0-100 scale stored in User.trustScore
 *   - Computed by TrustScoreEngine from: reviews, trips, account age, identity, cancellation, inactivity
 *   - Uses CAS-atomic updates (atomicTrustDelta) to prevent race conditions
 *   - Capped at +5/day to prevent manipulation
 *
 * Usage:
 *   <TrustBadge score={87} />
 *   <TrustBadge score={87} variant="compact" />
 */

interface TrustBadgeProps {
    score: number;
    isVerified?: boolean;
    variant?: 'default' | 'compact' | 'hero';
    className?: string;
}

function getScoreTier(score: number) {
    if (score >= 80) return {
        label: 'Çok Güvenilir',
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        ringColor: 'ring-emerald-500/20',
        Icon: ShieldCheck,
    };
    if (score >= 60) return {
        label: 'Güvenilir',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        ringColor: 'ring-blue-500/20',
        Icon: Shield,
    };
    if (score >= 40) return {
        label: 'Gelişiyor',
        color: 'from-amber-500 to-yellow-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        ringColor: 'ring-amber-500/20',
        Icon: Shield,
    };
    return {
        label: 'Yeni',
        color: 'from-gray-400 to-gray-500',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200',
        ringColor: 'ring-gray-500/20',
        Icon: ShieldAlert,
    };
}

export function TrustBadge({ score, isVerified, variant = 'default', className = '' }: TrustBadgeProps) {
    const tier = getScoreTier(score);
    const TierIcon = tier.Icon;
    const displayScore = Math.max(0, Math.min(100, Math.round(score)));

    // Compact variant: inline badge
    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${tier.bgColor} ${tier.borderColor} ${className}`}>
                <TierIcon className={`w-3.5 h-3.5 ${tier.textColor}`} />
                <span className={`text-xs font-bold ${tier.textColor}`}>
                    {displayScore}
                </span>
                {isVerified && (
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                )}
            </div>
        );
    }

    // Hero variant: large display for profile pages
    if (variant === 'hero') {
        return (
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${tier.bgColor} ${tier.borderColor} ring-1 ${tier.ringColor} ${className}`}>
                {/* Score Circle */}
                <div className="relative flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-xl font-bold">{displayScore}</span>
                    </div>
                    {/* Circular progress ring */}
                    <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            opacity="0.2"
                        />
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeDasharray={`${displayScore * 1.76} 176`}
                            strokeLinecap="round"
                            opacity="0.6"
                        />
                    </svg>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <TierIcon className={`w-5 h-5 ${tier.textColor}`} />
                        <span className={`font-bold text-sm ${tier.textColor}`}>{tier.label}</span>
                        {isVerified && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" /> Kimlik Onaylı
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Güven puanı 100 üzerinden değerlendirilir
                    </p>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${tier.bgColor} ${tier.borderColor} ${className}`}>
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-sm`}>
                <span className="text-white text-[10px] font-bold">{displayScore}</span>
            </div>
            <div className="flex flex-col">
                <span className={`text-xs font-bold ${tier.textColor} leading-tight`}>{tier.label}</span>
                <span className="text-[10px] text-gray-400 leading-tight">Güven Puanı</span>
            </div>
            {isVerified && (
                <ShieldCheck className="w-4 h-4 text-emerald-500 ml-0.5" />
            )}
        </div>
    );
}
