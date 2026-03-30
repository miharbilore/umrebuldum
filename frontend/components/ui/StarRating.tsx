'use client';

/**
 * StarRating — Renders full, half, and empty stars for a given 0–5 rating.
 * 
 * Usage:
 *   <StarRating rating={4.3} />
 *   <StarRating rating={4.3} size="lg" showValue />
 */

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    reviewCount?: number;
    className?: string;
}

export function StarRating({
    rating,
    maxStars = 5,
    size = 'md',
    showValue = false,
    reviewCount,
    className = '',
}: StarRatingProps) {
    const clampedRating = Math.max(0, Math.min(rating, maxStars));

    const sizeMap = {
        sm: { star: 'w-3.5 h-3.5', text: 'text-xs', gap: 'gap-0.5' },
        md: { star: 'w-4.5 h-4.5', text: 'text-sm', gap: 'gap-0.5' },
        lg: { star: 'w-5.5 h-5.5', text: 'text-base', gap: 'gap-1' },
    };

    const s = sizeMap[size];

    const stars = [];
    for (let i = 1; i <= maxStars; i++) {
        if (i <= Math.floor(clampedRating)) {
            // Full star
            stars.push(
                <svg key={i} className={`${s.star} text-amber-400`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            );
        } else if (i === Math.ceil(clampedRating) && clampedRating % 1 !== 0) {
            // Half star
            const fillPercent = Math.round((clampedRating % 1) * 100);
            stars.push(
                <svg key={i} className={`${s.star} text-gray-200`} viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id={`half-star-${i}-${fillPercent}`}>
                            <stop offset={`${fillPercent}%`} stopColor="#fbbf24" />
                            <stop offset={`${fillPercent}%`} stopColor="currentColor" />
                        </linearGradient>
                    </defs>
                    <path
                        fill={`url(#half-star-${i}-${fillPercent})`}
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                </svg>
            );
        } else {
            // Empty star
            stars.push(
                <svg key={i} className={`${s.star} text-gray-200`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            );
        }
    }

    return (
        <div className={`inline-flex items-center ${s.gap} ${className}`}>
            <div className={`flex items-center ${s.gap}`}>
                {stars}
            </div>
            {showValue && (
                <span className={`font-semibold text-gray-800 ml-1 ${s.text}`}>
                    {clampedRating.toFixed(1)}
                </span>
            )}
            {reviewCount !== undefined && (
                <span className={`text-gray-400 ml-0.5 ${s.text}`}>
                    ({reviewCount})
                </span>
            )}
        </div>
    );
}
