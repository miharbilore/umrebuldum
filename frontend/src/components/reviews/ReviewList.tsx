'use client';

import { useState, useEffect } from 'react';
import { ReviewCard } from './ReviewCard';
import { StarRating } from '@/components/ui/StarRating';
import { Loader2, MessageSquareText, ChevronDown } from 'lucide-react';

/**
 * ReviewList — Fetches and displays paginated APPROVED reviews for a guide.
 * Uses client-side fetching from GET /api/reviews?guideId=xxx
 */

interface ReviewListProps {
    guideId: string;
    averageRating?: number;
    reviewCount?: number;
}

interface ReviewData {
    id: string;
    overallRating: number | string;
    ratingCommunication: number;
    ratingKnowledge: number;
    ratingOrganization: number;
    ratingTimeManagement: number;
    comment: string | null;
    positiveTags: string[];
    negativeTags: string[];
    createdAt: string;
    approvedAt: string | null;
    reviewer: {
        id: string;
        name: string | null;
        fullName: string | null;
        image: string | null;
    };
}

export function ReviewList({ guideId, averageRating, reviewCount }: ReviewListProps) {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = async (pageNum: number, append = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            const res = await fetch(`/api/reviews?guideId=${guideId}&page=${pageNum}&limit=5`);
            if (!res.ok) throw new Error('Yorumlar yüklenemedi');

            const data = await res.json();
            
            if (append) {
                setReviews(prev => [...prev, ...(data.data || [])]);
            } else {
                setReviews(data.data || []);
            }
            setTotalCount(data.metadata?.totalCount || 0);
            setTotalPages(data.metadata?.totalPages || 0);
            setPage(pageNum);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Bir hata oluştu');
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchReviews(1);
    }, [guideId]);

    const handleLoadMore = () => {
        if (page < totalPages) {
            fetchReviews(page + 1, true);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl border p-5 space-y-3 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                                <div className="h-3 w-20 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded" />
                        <div className="h-4 w-3/4 bg-gray-100 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-sm text-red-600">
                {error}
            </div>
        );
    }

    const displayAvg = averageRating ?? 0;
    const displayCount = reviewCount ?? totalCount;

    return (
        <div id="reviews-section" className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquareText className="w-5 h-5 text-amber-500" />
                        Değerlendirmeler
                    </h2>
                    {displayCount > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <StarRating rating={displayAvg} size="md" showValue />
                            <span className="text-sm text-gray-500">
                                ({displayCount} değerlendirme)
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* No Reviews */}
            {reviews.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <MessageSquareText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Henüz değerlendirme yok</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Bu rehber için ilk yorumu siz bırakın!
                    </p>
                </div>
            )}

            {/* Review Cards */}
            <div className="space-y-3">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showSubRatings />
                ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
                <div className="text-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                    >
                        {loadingMore ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                        Daha Fazla Yorum Yükle
                        <span className="text-gray-400">
                            ({reviews.length}/{displayCount})
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
