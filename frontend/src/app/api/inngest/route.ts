import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { notificationRouter } from "@/inngest/functions/notification-router";
import { handlePaymentCompletion } from "@/inngest/functions/payment-worker";
import { handleRatingWorker } from "@/inngest/functions/rating-worker";

// Register your functions here
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        notificationRouter,
        handlePaymentCompletion,
        handleRatingWorker,
        // Any other background jobs will be added here
    ]
});
