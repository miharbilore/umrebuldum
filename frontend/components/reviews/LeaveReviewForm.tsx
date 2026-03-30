'use client';

import { useState } from 'react';
import { Star, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * LeaveReviewForm — Allows authenticated users to rate and review a guide.
 * Posts to POST /api/reviews.
 */

interface LeaveReviewFormProps {
    guideId: string;
    requestId: string;
    onSuccess?: () => void;
}

const POSITIVE_TAGS = [
    'Bilgili', 'Güler Yüzlü', 'Dakik', 'Organize', 'Sabırlı', 'Yardımsever',
];

const NEGATIVE_TAGS = [
    'Geç Kaldı', 'İlgisiz', 'Bilgi Eksik', 'Düzensiz',
];

const CATEGORY_LABELS = {
    ratingCommunication: 'İletişim',
    ratingKnowledge: 'Bilgi & Deneyim',
    ratingOrganization: 'Organizasyon',
    ratingTimeManagement: 'Zaman Yönetimi',
} as const;

type CategoryKey = keyof typeof CATEGORY_LABELS;

export function LeaveReviewForm({ guideId, requestId, onSuccess }: LeaveReviewFormProps) {
    const [ratings, setRatings] = useState<Record<CategoryKey, number>>({
        ratingCommunication: 0,
        ratingKnowledge: 0,
        ratingOrganization: 0,
        ratingTimeManagement: 0,
    });
    const [hoverRating, setHoverRating] = useState<Record<CategoryKey, number>>({
        ratingCommunication: 0,
        ratingKnowledge: 0,
        ratingOrganization: 0,
        ratingTimeManagement: 0,
    });
    const [selectedPositive, setSelectedPositive] = useState<string[]>([]);
    const [selectedNegative, setSelectedNegative] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const toggleTag = (tag: string, type: 'positive' | 'negative') => {
        if (type === 'positive') {
            setSelectedPositive(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            );
        } else {
            setSelectedNegative(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            );
        }
    };

    const allRated = Object.values(ratings).every(r => r > 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!allRated) {
            toast.error('Lütfen tüm kategorileri puanlayın.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guideId,
                    requestId,
                    ...ratings,
                    positiveTags: selectedPositive,
                    negativeTags: selectedNegative,
                    comment: comment.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error?.message || data.error || 'Bir hata oluştu');
            }

            setSubmitted(true);
            toast.success('Değerlendirmeniz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.', {
                duration: 5000,
                icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            });
            onSuccess?.();
        } catch (err: any) {
            toast.error(err.message || 'Değerlendirme gönderilemedi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Success state
    if (submitted) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-emerald-800">Teşekkürler!</h3>
                <p className="text-emerald-600 text-sm mt-2">
                    Değerlendirmeniz onay sürecine alındı. Onaylandıktan sonra diğer kullanıcılar görebilecek.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Değerlendirmenizi Bırakın</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Deneyiminizi puanlayarak diğer hacılara yardımcı olun.
                </p>
            </div>

            {/* Category Ratings */}
            <div className="space-y-4">
                {(Object.entries(CATEGORY_LABELS) as [CategoryKey, string][]).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isActive = star <= (hoverRating[key] || ratings[key]);
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(prev => ({ ...prev, [key]: star }))}
                                        onMouseLeave={() => setHoverRating(prev => ({ ...prev, [key]: 0 }))}
                                        onClick={() => setRatings(prev => ({ ...prev, [key]: star }))}
                                        className="p-0.5 transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-6 h-6 transition-colors ${
                                                isActive
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-gray-200 hover:text-amber-200'
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Positive Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Olumlu Yönler
                </label>
                <div className="flex flex-wrap gap-2">
                    {POSITIVE_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag, 'positive')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                selectedPositive.includes(tag)
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {selectedPositive.includes(tag) ? '✓ ' : ''}{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Negative Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    İyileştirilebilecek Yönler
                </label>
                <div className="flex flex-wrap gap-2">
                    {NEGATIVE_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag, 'negative')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                selectedNegative.includes(tag)
                                    ? 'bg-red-50 text-red-600 border-red-300 ring-1 ring-red-200'
                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {selectedNegative.includes(tag) ? '✗ ' : ''}{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Yorumunuz <span className="text-gray-400 font-normal">(isteğe bağlı, max 500 karakter)</span>
                </label>
                <textarea
                    id="review-comment"
                    rows={4}
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Deneyiminizi paylaşın..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition resize-none"
                />
                <div className="text-right mt-1">
                    <span className={`text-xs ${comment.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                        {comment.length}/500
                    </span>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={!allRated || submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-sm hover:from-teal-700 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
                Değerlendirmeyi Gönder
            </button>
        </form>
    );
}
