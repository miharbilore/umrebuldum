import { safeInngestSend } from "@/lib/inngest/safeSend";
import { inngest } from "@/inngest/client";

// â”€â”€â”€ Event Bus (Inngest Adapter) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Replaces the old in-memory event bus with robust serverless background jobs.
//
// Usage:
//   EventBus.emit("OFFER_CREATED", { offerId, guideId, demandId });

export type EventName =
    | "OFFER_CREATED"
    | "OFFER_ACCEPTED"
    | "OFFER_REJECTED"
    | "OFFER_EXPIRED"
    | "LISTING_CREATED"
    | "LISTING_EXPIRED"
    | "LISTING_REPUBLISHED"
    | "LISTING_BOOSTED"
    | "DEMAND_CREATED"
    | "DEMAND_EXPIRED"
    | "DEMAND_UNLOCKED" // Added for pay-per-lead
    | "TOKEN_SPENT"
    | "TOKEN_GRANTED"
    | "TOKEN_RENEWED"
    | "PACKAGE_UPGRADED"
    | "PACKAGE_DOWNGRADED"
    | "PLAN_UPGRADED"
    | "PLAN_DOWNGRADE_SCHEDULED"
    | "PLAN_FROZEN"
    | "IDENTITY_APPROVED"
    | "IDENTITY_REVOKED"
    | "MESSAGE_RECEIVED"
    | "PERFORMANCE_TIER_CHANGED"
    | "CREDIT_LINE_DRAWN"
    | "CREDIT_LINE_REPAID"
    | "AUTO_REPLENISH_CONFIGURED"
    | "AUTO_REPLENISH_SUCCESS"
    | "AUTO_REPLENISH_ALERT"
    | "AUTO_REPLENISH_SUSPENDED"
    | "PAYMENT_COMPLETED"
    | "NOTIFICATION_CREATE"
    | "REVIEW_APPROVED";

/**
 * @deprecated The old InMemoryEventBus class. Handlers here exist only for backwards compatibility or tests.
 * All real emissions should now go to Inngest.
 */
class DeprecatedInMemoryEventBus {
    private handlers = new Map<string, Function[]>();

    on<T = any>(event: EventName, handler: (data: T) => Promise<void>): void {
        const existing = this.handlers.get(event) || [];
        existing.push(handler);
        this.handlers.set(event, existing);
    }

    off(event: EventName, handler: Function): void {
        const existing = this.handlers.get(event) || [];
        this.handlers.set(event, existing.filter((h) => h !== handler));
    }

    /**
     * @description Sends the event to Inngest for queue processing.
     */
    async emit<T = any>(event: EventName, data: T): Promise<void> {
        // Dispatch to Inngest for robust background processing
        await safeInngestSend(inngest, {
            name: `event/${event}`,
            data,
        });

        // For local tests or un-migrated listeners, we keep this alive.
        const handlers = this.handlers.get(event) || [];
        if (handlers.length === 0) return;

        Promise.allSettled(handlers.map((handler) => handler(data))).catch(console.error);
    }
}

// Singleton
export const EventBus = new DeprecatedInMemoryEventBus();

