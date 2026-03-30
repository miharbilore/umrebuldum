import type { PaymentGateway, PaymentProvider } from "./payment-gateway";
import { StripeGateway } from "./gateways/stripe-gateway";
import { PayTRGateway } from "./gateways/paytr-gateway";

/**
 * Payment Router — Intelligent provider selection
 *
 * Routing rules (in priority order):
 * 1. Explicit user selection → use selected provider
 * 2. PayTR not configured → fallback to Stripe
 * 3. Default provider from env → DEFAULT_PAYMENT_PROVIDER
 * 4. Final fallback → Stripe
 */

// Singleton gateway instances
let stripeGateway: StripeGateway | null = null;
let paytrGateway: PayTRGateway | null = null;

function getStripeGateway(): StripeGateway {
    if (!stripeGateway) {
        stripeGateway = new StripeGateway();
    }
    return stripeGateway;
}

function getPayTRGateway(): PayTRGateway {
    if (!paytrGateway) {
        paytrGateway = new PayTRGateway();
    }
    return paytrGateway;
}

/**
 * Check if PayTR is properly configured.
 */
function isPayTRConfigured(): boolean {
    return !!(
        process.env.PAYTR_MERCHANT_ID &&
        process.env.PAYTR_MERCHANT_KEY &&
        process.env.PAYTR_MERCHANT_SALT
    );
}

/**
 * Get the default provider from environment.
 */
function getDefaultProvider(): PaymentProvider {
    const envDefault = process.env.DEFAULT_PAYMENT_PROVIDER;
    if (envDefault === "paytr" && isPayTRConfigured()) {
        return "paytr";
    }
    return "stripe";
}

/**
 * Select and return the appropriate payment gateway.
 *
 * @param preferredProvider - User's explicit choice (optional)
 * @returns The selected PaymentGateway instance
 */
export function selectGateway(preferredProvider?: PaymentProvider): PaymentGateway {
    // 1. User explicitly selected a provider
    if (preferredProvider === "paytr") {
        if (isPayTRConfigured()) {
            return getPayTRGateway();
        }
        console.warn("[PaymentRouter] PayTR requested but not configured, falling back to Stripe");
        return getStripeGateway();
    }

    if (preferredProvider === "stripe") {
        return getStripeGateway();
    }

    // 2. No explicit preference → use default
    const defaultProvider = getDefaultProvider();
    if (defaultProvider === "paytr") {
        return getPayTRGateway();
    }

    return getStripeGateway();
}

/**
 * Get a gateway by provider name (for webhook/callback handling).
 */
export function getGatewayByProvider(provider: PaymentProvider): PaymentGateway {
    switch (provider) {
        case "paytr":
            return getPayTRGateway();
        case "stripe":
            return getStripeGateway();
        default:
            throw new Error(`Unknown payment provider: ${provider}`);
    }
}

/**
 * Get available providers for the current configuration.
 */
export function getAvailableProviders(): PaymentProvider[] {
    const providers: PaymentProvider[] = ["stripe"];
    if (isPayTRConfigured()) {
        providers.push("paytr");
    }
    return providers;
}
