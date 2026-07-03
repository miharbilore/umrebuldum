'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, CheckCircle, XCircle, Star, MessageCircle } from 'lucide-react';
import { Prisma } from '@/../prisma/generated-client';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                />
            ))}
        </div>
    );
}

export default function PendingReviewsPanel() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/reviews?status=PENDING', fetcher);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleAction = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessingId(reviewId);
        try {
            const res = await fetch('/api/admin/reviews/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, status })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "İşlem başarısız.");
            }

            mutate();
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else alert(String(err));
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-800 rounded-xl" />
                <div className="h-20 bg-gray-800 rounded-xl" />
                <div className="h-20 bg-gray-800 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-400 p-4 bg-red-500/10 rounded-xl">Yorumları çekerken hata oluştu.</div>;
    }

    const reviews = data?.data || [];

    if (reviews.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">Bekleyen Yorum Yok</h3>
                <p className="text-gray-400">Tüm değerlendirmeler işlenmiş durumda.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="text-amber-500" />
                Onay Bekleyen Değerlendirmeler
                <span className="ml-2 bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full">
                    {data?.metadata?.totalCount || reviews.length}
                </span>
            </h2>

            <div className="space-y-3">
                {reviews.map((review: Prisma.ReviewGetPayload<{ include: { reviewer: true, guide: true, request: true } }>) => {
                    const isExpanded = expandedId === review.id;
                    const overall = Number(review.overallRating || 0);

                    return (
                        <div
                            key={review.id}
                            className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden transition-all"
                        >
                            {/* Summary Row */}
                            <div
                                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-800/80 transition"
                                onClick={() => setExpandedId(isExpanded ? null : review.id)}
                            >
                                {/* Overall Rating Badge */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center">
                                    <span className="text-amber-400 font-bold text-lg leading-none">{overall.toFixed(1)}</span>
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 mt-0.5" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium text-sm">{review.reviewer?.name || review.reviewer?.email || 'Anonim'}</span>
                                        <span className="text-gray-600">→</span>
                                        <span className="text-emerald-400 text-sm font-medium">{review.guide?.name || review.guide?.email || 'Rehber'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Talep: {review.request?.departureCity || 'N/A'} • {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        disabled={processingId === review.id}
                                        onClick={(e) => { e.stopPropagation(); handleAction(review.id, 'REJECTED'); }}
                                        className="px-3 py-1.5 text-gray-400 hover:text-red-400 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50 flex items-center gap-1 text-sm"
                                    >
                                        <XCircle className="w-4 h-4" /> Reddet
                                    </button>
                                    <button
                                        disabled={processingId === review.id}
                                        onClick={(e) => { e.stopPropagation(); handleAction(review.id, 'APPROVED'); }}
                                        className="px-3 py-1.5 text-emerald-950 font-medium bg-emerald-500 hover:bg-emerald-400 rounded-md transition disabled:opacity-50 flex items-center gap-1 text-sm"
                                    >
                                        {processingId === review.id
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <CheckCircle className="w-4 h-4" />
                                        }
                                        Onayla
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            {isExpanded && (
                                <div className="px-5 pb-5 pt-2 border-t border-gray-700 space-y-3">
                                    {/* Sub-ratings */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-gray-900 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">İletişim</p>
                                            <StarDisplay rating={review.ratingCommunication} />
                                        </div>
                                        <div className="bg-gray-900 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Bilgi</p>
                                            <StarDisplay rating={review.ratingKnowledge} />
                                        </div>
                                        <div className="bg-gray-900 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Organizasyon</p>
                                            <StarDisplay rating={review.ratingOrganization} />
                                        </div>
                                        <div className="bg-gray-900 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Zaman Yönetimi</p>
                                            <StarDisplay rating={review.ratingTimeManagement} />
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {((review.positiveTags as string[])?.length > 0 || (review.negativeTags as string[])?.length > 0) && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {((review.positiveTags as string[]) || []).map((tag: string, i: number) => (
                                                <span key={`p-${i}`} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                                                    ✓ {tag}
                                                </span>
                                            ))}
                                            {((review.negativeTags as string[]) || []).map((tag: string, i: number) => (
                                                <span key={`n-${i}`} className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full">
                                                    ✗ {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment */}
                                    {review.comment && (
                                        <div className="bg-gray-900 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 mb-2 font-medium">Yorum:</p>
                                            <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
