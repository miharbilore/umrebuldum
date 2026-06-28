/**
 * Payment Gateway Abstraction Layer
 *
 * Strategy pattern: each payment provider implements this interface.
 * The PaymentRouter selects which gateway to use based on context.
 *
 * Key design decisions:
 * - SessionResult has two modes: "redirect" (Stripe) and "iframe" (PayTR)
 * - No raw card data ever touches our servers (PCI-DSS SAQ-A)
 * - All providers must support 3D Secure
 */

// ─── Core Types ─────────────────────────────────────────────────────────

export type PaymentProvider = "stripe" | "paytr" | "iyzico";

export interface CreateSessionParams {
    userId: string;
    packageId: string;
    amountTRY: number;
    credits: number;
    email: string;
    role: string;
    successUrl: string;
    cancelUrl: string;
    internalTxId: string;
    savedCardToken?: string;   // Pay with a saved card
    storeCard?: boolean;       // Save the card for future use
    userToken?: string;        // PayTR: utoken for returning customers
    couponCode?: string;
}

export interface SessionResult {
    /** "redirect" = navigate to external URL (Stripe), "iframe" = embed token (PayTR) */
    type: "redirect" | "iframe";
    /** Stripe: checkout session URL */
    url?: string;
    /** PayTR: iframe_token for embedding */
    iframeToken?: string;
    /** Provider-specific session identifier */
    sessionId: string;
}

export interface CallbackResult {
    success: boolean;
    merchantOid?: string;     // PayTR: merchant_oid
    sessionId?: string;       // Stripe: session.id
    userId?: string;
    credits?: number;
    cardToken?: string;       // If card was stored: ctoken (PayTR) or pm_xxx (Stripe)
    userToken?: string;       // PayTR: utoken
    last4?: string;
    brand?: string;
    error?: string;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    error?: string;
}

export interface SavedCardInfo {
    id: string;
    provider: PaymentProvider;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
}

// ─── Gateway Interface ──────────────────────────────────────────────────

export interface PaymentGateway {
    readonly provider: PaymentProvider;

    /**
     * Create a payment session.
     * - Stripe: Creates a Checkout Session and returns redirect URL
     * - PayTR: Fetches iframe_token and returns it for embedding
     */
    createSession(params: CreateSessionParams): Promise<SessionResult>;

    /**
     * Verify and process a payment callback/webhook.
     * - Stripe: Verify webhook signature, extract session data
     * - PayTR: Verify HMAC hash, extract merchant_oid
     */
    verifyCallback(payload: unknown, signature?: string): Promise<CallbackResult>;

    /**
     * Process a refund for a completed transaction.
     */
    refund(providerRef: string, amountInKurus: number): Promise<RefundResult>;
}
