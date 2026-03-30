import { serve } from "inngest/next";
import { inngest } from "@/src/inngest/client";
import { handleNotificationRouting } from "@/src/inngest/functions/notification-router";
import { handlePaymentCompletion } from "@/src/inngest/functions/payment-worker";
import { handleRatingWorker } from "@/src/inngest/functions/rating-worker";

// Register your functions here
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        handleNotificationRouting,
        handlePaymentCompletion,
        handleRatingWorker,
        // Any other background jobs will be added here
    ]
});
