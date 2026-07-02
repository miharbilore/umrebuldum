import Stripe from "stripe";
import type {
    PaymentGateway,
    CreateSessionParams,
    SessionResult,
    CallbackResult,
    RefundResult,
} from "../payment-gateway";

export interface StripeWebhookEvent {
    body: string;
    signature: string;
}

/**
 * Stripe Payment Gateway
 *
 * Uses Stripe Checkout Sessions (hosted page) for maximum PCI-DSS SAQ-A compliance.
 * 3D Secure is requested on every transaction via payment_method_options.
 *
 * Tokenization: Stripe handles all card data through its hosted form.
 * Card storage: Uses Stripe Customer + PaymentMethod objects.
 */
export class StripeGateway implements PaymentGateway {
    readonly provider = "stripe" as const;

    private stripeClient?: Stripe;

    private getStripeClient(): Stripe {
        if (!this.stripeClient) {
            const secretKey = process.env.STRIPE_SECRET_KEY;
            if (!secretKey) {
                console.warn("[StripeGateway] STRIPE_SECRET_KEY is not set.");
                this.stripeClient = new Stripe("dummy_key", {
                    apiVersion: "2026-01-28.clover",
                });
            } else {
                this.stripeClient = new Stripe(secretKey, {
                    apiVersion: "2026-01-28.clover",
                });
            }
        }
        return this.stripeClient;
    }

    async createSession(params: CreateSessionParams): Promise<SessionResult> {
        const session = await this.getStripeClient().checkout.sessions.create(
            {
                payment_method_types: ["card"],
                mode: "payment",
                customer_email: params.email || undefined,
                payment_method_options: {
                    card: {
                        request_three_d_secure: "any", // 3D Secure zorunlu
                    },
                },
                line_items: [
                    {
                        price_data: {
                            currency: "try",
                            product_data: {
                                name: `${params.credits} Kredi Paketi`,
                                description: "UmreBuldum kredi paketi",
                            },
                            unit_amount: Math.round(params.amountTRY * 100), // kuruş
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    userId: params.userId,
                    credits: String(params.credits),
                    packageId: params.packageId,
                    role: params.role,
                    internalTxId: params.internalTxId,
                    provider: "stripe",
                },
                success_url: params.successUrl,
                cancel_url: params.cancelUrl,
            },
            {
                idempotencyKey: `checkout:${params.userId}:${params.packageId}:${params.internalTxId}`,
            }
        );

        return {
            type: "redirect",
            url: session.url!,
            sessionId: session.id,
        };
    }

    async verifyCallback(
        payload: unknown,
    ): Promise<CallbackResult> {
        const typedPayload = payload as StripeWebhookEvent;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

        let event: Stripe.Event;
        try {
            event = this.getStripeClient().webhooks.constructEvent(
                typedPayload.body,
                typedPayload.signature,
                webhookSecret
            );
        } catch (err: unknown) {
            if (err instanceof Error) {
                return { success: false, error: `Signature verification failed: ${err.message}` };
            }
            return { success: false, error: "Signature verification failed: Unknown error" };
        }

        if (event.type !== "checkout.session.completed") {
            return { success: false, error: `Unhandled event type: ${event.type}` };
        }

        const session = event.data.object as Awaited<ReturnType<InstanceType<typeof Stripe>["checkout"]["sessions"]["create"]>>;
        const metadata = session.metadata;

        if (!metadata?.userId || !metadata?.credits) {
            return { success: false, error: "Missing metadata in session" };
        }

        return {
            success: true,
            sessionId: session.id,
            userId: metadata.userId,
            credits: parseInt(metadata.credits),
        };
    }

    async refund(paymentIntentId: string, amountInKurus: number): Promise<RefundResult> {
        try {
            const refund = await this.getStripeClient().refunds.create({
                payment_intent: paymentIntentId,
                amount: amountInKurus,
                reason: "requested_by_customer",
            });

            return { success: true, refundId: refund.id };
        } catch (err: unknown) {
            if (err instanceof Error) {
                return { success: false, error: err.message };
            }
            return { success: false, error: "An unknown error occurred" };
        }
    }

    /**
     * Retrieve the Stripe Checkout Session to get payment_intent for refunds, etc.
     */
    async getSessionDetails(sessionId: string) {
        return this.getStripeClient().checkout.sessions.retrieve(sessionId);
    }
}
