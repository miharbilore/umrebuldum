'use client';

import { ReviewList } from './ReviewList';
import { LeaveReviewForm } from './LeaveReviewForm';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * ListingReviewSection — Combined review display + review form for a listing page.
 * Shows ReviewList (fetches from API) and LeaveReviewForm (if user is authenticated).
 */

interface ListingReviewSectionProps {
    guideId: string;
    requestId?: string;
    averageRating?: number;
    reviewCount?: number;
}

export function ListingReviewSection({
    guideId,
    requestId,
    averageRating,
    reviewCount,
}: ListingReviewSectionProps) {
    const { data: session } = useSession();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleReviewSuccess = () => {
        // Refresh the review list after successful submission
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            {/* Review List */}
            <ReviewList
                key={refreshKey}
                guideId={guideId}
                averageRating={averageRating}
                reviewCount={reviewCount}
            />

            {/* Leave Review Form (authenticated users only) */}
            {session?.user && requestId && (
                <LeaveReviewForm
                    guideId={guideId}
                    requestId={requestId}
                    onSuccess={handleReviewSuccess}
                />
            )}

            {/* Prompt to log in */}
            {!session?.user && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-500 text-sm">
                        Değerlendirme bırakmak için{' '}
                        <a href="/giris" className="text-teal-600 font-semibold hover:underline">
                            giriş yapın
                        </a>
                        .
                    </p>
                </div>
            )}
        </div>
    );
}
