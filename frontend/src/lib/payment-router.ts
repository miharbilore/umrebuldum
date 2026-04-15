import type { PaymentGateway, PaymentProvider } from "./payment-gateway";
import { StripeGateway } from "./gateways/stripe-gateway";
import { PayTRGateway } from "./gateways/paytr-gateway";
import { IyzicoGateway } from "./gateways/iyzico-gateway";

/**
 * Payment Router — Intelligent provider selection
 *
 * Routing rules (in priority order):
 * 1. Explicit user selection → use selected provider
 * 2. Iyzico/PayTR configured → prioritize these for local market
 * 3. Default provider from env → DEFAULT_PAYMENT_PROVIDER
 * 4. Final fallback → Iyzico
 */

// Singleton gateway instances
let stripeGateway: StripeGateway | null = null;
let paytrGateway: PayTRGateway | null = null;
let iyzicoGateway: IyzicoGateway | null = null;

function getStripeGateway(): StripeGateway {
    if (!stripeGateway) stripeGateway = new StripeGateway();
    return stripeGateway;
}

function getPayTRGateway(): PayTRGateway {
    if (!paytrGateway) paytrGateway = new PayTRGateway();
    return paytrGateway;
}

function getIyzicoGateway(): IyzicoGateway {
    if (!iyzicoGateway) iyzicoGateway = new IyzicoGateway();
    return iyzicoGateway;
}

/** Configuration checks */
function isPayTRConfigured(): boolean {
    return !!(process.env.PAYTR_MERCHANT_ID && process.env.PAYTR_MERCHANT_KEY && process.env.PAYTR_MERCHANT_SALT);
}

function isIyzicoConfigured(): boolean {
    return !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

/**
 * Get the default provider from environment.
 */
function getDefaultProvider(): PaymentProvider {
    const envDefault = process.env.DEFAULT_PAYMENT_PROVIDER as PaymentProvider;
    
    if (envDefault === "iyzico" && isIyzicoConfigured()) return "iyzico";
    if (envDefault === "paytr" && isPayTRConfigured()) return "paytr";
    
    // Auto-select based on configuration
    if (isIyzicoConfigured()) return "iyzico";
    if (isPayTRConfigured()) return "paytr";
    
    return "stripe"; // Stripe remains as theoretical fallback but passive
}

/**
 * Select and return the appropriate payment gateway.
 */
export function selectGateway(preferredProvider?: PaymentProvider): PaymentGateway {
    // 1. User explicitly selected a provider
    if (preferredProvider === "iyzico" && isIyzicoConfigured()) return getIyzicoGateway();
    if (preferredProvider === "paytr" && isPayTRConfigured()) return getPayTRGateway();
    if (preferredProvider === "stripe") return getStripeGateway();

    // 2. No explicit preference → use default logic
    const defaultProvider = getDefaultProvider();
    if (defaultProvider === "iyzico") return getIyzicoGateway();
    if (defaultProvider === "paytr") return getPayTRGateway();

    return getStripeGateway();
}

/**
 * Get a gateway by provider name (for webhook/callback handling).
 */
export function getGatewayByProvider(provider: PaymentProvider): PaymentGateway {
    switch (provider) {
        case "iyzico": return getIyzicoGateway();
        case "paytr": return getPayTRGateway();
        case "stripe": return getStripeGateway();
        default: throw new Error(`Unknown payment provider: ${provider}`);
    }
}

/**
 * Get available providers for the current configuration.
 * STRIPE is deliberately omitted here to keep it passive in UI.
 */
export function getAvailableProviders(): PaymentProvider[] {
    const providers: PaymentProvider[] = [];
    if (isIyzicoConfigured()) providers.push("iyzico");
    if (isPayTRConfigured()) providers.push("paytr");
    return providers;
}
