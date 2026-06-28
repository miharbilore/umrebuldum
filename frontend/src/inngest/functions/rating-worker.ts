import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";

/**
 * Rating Worker
 *
 * Listens to "REVIEW_APPROVED" event.
 * Computes the new average rating and updates the GuideProfile caching fields.
 * This guarantees extreme performance at the presentation layer (search, list).
 */
export const handleRatingWorker = inngest.createFunction(
    { id: "rating-worker", name: "Rating Average Computing Worker", retries: 3, triggers: [{ event: "event/REVIEW_APPROVED" }] },
    async ({ event, step }) => {
        const { guideId } = event.data;

        if (!guideId) {
            return { skipped: "Missing guideId" };
        }

        // 1. Recompute Average Rating + Review Count Atomically
        const result = await step.run("update-guide-metrics", async () => {
            // Aggregate all APPROVED reviews for this guide
            const aggregations = await prisma.review.aggregate({
                where: {
                    guideId: guideId,
                    status: "APPROVED"
                },
                _avg: {
                    overallRating: true
                },
                _count: {
                    id: true
                }
            });

            // Convert Decimal to Float
            const rawAvg = aggregations._avg.overallRating;
            const newAvg = rawAvg ? Number(rawAvg) : 0;
            const newCount = aggregations._count.id || 0;

            // Update GuideProfile
            const updated = await prisma.guideProfile.update({
                where: { userId: guideId },
                data: {
                    averageRating: newAvg,
                    reviewCount: newCount
                }
            });

            return {
                averageRating: updated.averageRating,
                reviewCount: updated.reviewCount
            };
        });

        return {
            success: true,
            guideId,
            metrics: result
        };
    }
);
