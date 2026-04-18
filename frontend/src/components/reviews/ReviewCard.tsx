'use client';

import { StarRating } from '@/components/ui/StarRating';
import Image from "next/image";

/**
 * ReviewCard — Displays a single customer review with rating, comment, tags, and date.
 */

interface ReviewCardProps {
    review: {
        id: string;
        overallRating: number | string;
        ratingCommunication?: number;
        ratingKnowledge?: number;
        ratingOrganization?: number;
        ratingTimeManagement?: number;
        comment?: string | null;
        positiveTags?: string[];
        negativeTags?: string[];
        createdAt: string;
        approvedAt?: string | null;
        reviewer?: {
            id?: string;
            name?: string | null;
            fullName?: string | null;
            image?: string | null;
        };
    };
    showSubRatings?: boolean;
}

export function ReviewCard({ review, showSubRatings = false }: ReviewCardProps) {
    const overall = Number(review.overallRating || 0);
    const reviewerName = review.reviewer?.fullName || review.reviewer?.name || 'Anonim Kullanıcı';
    const reviewerInitial = reviewerName.charAt(0).toUpperCase();
    const date = review.approvedAt || review.createdAt;

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow duration-300">
            {/* Header: Avatar + Name + Stars + Date */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {review.reviewer?.image ? (
                        <Image
                            src={review.reviewer.image}
                            alt={reviewerName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover border-2 border-gray-100"
                            sizes="40px"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {reviewerInitial}
                        </div>
                    )}
                </div>

                {/* Name + Rating */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {reviewerName}
                        </h4>
                        <time className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(date).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </time>
                    </div>
                    <StarRating rating={overall} size="sm" showValue className="mt-1" />
                </div>
            </div>

            {/* Sub-ratings (optional) */}
            {showSubRatings && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {review.ratingCommunication !== undefined && (
                        <SubRatingRow label="İletişim" value={review.ratingCommunication} />
                    )}
                    {review.ratingKnowledge !== undefined && (
                        <SubRatingRow label="Bilgi" value={review.ratingKnowledge} />
                    )}
                    {review.ratingOrganization !== undefined && (
                        <SubRatingRow label="Organizasyon" value={review.ratingOrganization} />
                    )}
                    {review.ratingTimeManagement !== undefined && (
                        <SubRatingRow label="Zaman Yönetimi" value={review.ratingTimeManagement} />
                    )}
                </div>
            )}

            {/* Tags */}
            {((review.positiveTags && review.positiveTags.length > 0) || (review.negativeTags && review.negativeTags.length > 0)) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {(review.positiveTags || []).map((tag, i) => (
                        <span key={`p-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-medium rounded-full border border-emerald-100">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            {tag}
                        </span>
                    ))}
                    {(review.negativeTags || []).map((tag, i) => (
                        <span key={`n-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-[11px] font-medium rounded-full border border-red-100">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Comment */}
            {review.comment && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                </p>
            )}
        </div>
    );
}

function SubRatingRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-500">{label}</span>
            <div className="flex items-center gap-1">
                <div className="h-1.5 w-12 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${(value / 5) * 100}%` }}
                    />
                </div>
                <span className="text-xs font-semibold text-gray-700">{value}</span>
            </div>
        </div>
    );
}
