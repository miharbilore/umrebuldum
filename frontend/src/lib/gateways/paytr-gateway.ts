import crypto from "crypto";
import type {
    PaymentGateway,
    CreateSessionParams,
    SessionResult,
    CallbackResult,
    RefundResult,
} from "../payment-gateway";

/**
 * PayTR iFrame Payment Gateway
 *
 * Integration flow:
 * 1. Server â†’ POST https://www.paytr.com/odeme/api/get-token â†’ iframe_token
 * 2. Client â†’ <iframe src="https://www.paytr.com/odeme/guvenli/{iframe_token}">
 * 3. PayTR â†’ POST callback_url (server) â†’ HMAC hash verification â†’ grant tokens
 *
 * 3D Secure: Enforced by PayTR (configured in merchant panel: "3D Secure Zorunlu")
 * Tokenization: Card data handled entirely within PayTR's PCI Level 1 iframe
 * Card Storage (CAPI): store_card=1 + utoken in request â†’ ctoken in callback
 */

const PAYTR_API_URL = "https://www.paytr.com/odeme/api/get-token";

interface PayTRTokenResponse {
    status: "success" | "failed";
    token?: string;
    reason?: string;
}

export class PayTRGateway implements PaymentGateway {
    readonly provider = "paytr" as const;

    private merchantId: string;
    private merchantKey: string;
    private merchantSalt: string;
    private testMode: string;
    private callbackUrl: string;

    constructor() {
        this.merchantId = process.env.PAYTR_MERCHANT_ID || "";
        this.merchantKey = process.env.PAYTR_MERCHANT_KEY || "";
        this.merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
        this.testMode = process.env.PAYTR_TEST_MODE || "1";
        this.callbackUrl = process.env.PAYTR_CALLBACK_URL || "";

        if (!this.merchantId || !this.merchantKey || !this.merchantSalt) {
            console.warn("[PayTRGateway] PayTR credentials not fully configured");
        }
    }

    /**
     * Create a PayTR iframe token for embedded payment form.
     */
    async createSession(params: CreateSessionParams): Promise<SessionResult> {
        const merchantOid = params.internalTxId;
        const paymentAmount = Math.round(params.amountTRY * 100); // kuruş

        // PayTR user_basket format: [[product_name, price_str, quantity]]
        const userBasket = Buffer.from(
            JSON.stringify([[`${params.credits} Kredi Paketi`, String(params.amountTRY), 1]])
        ).toString("base64");

        // User IP â€” PayTR requires this; will be injected by the route handler
        const userIp = (params as any).userIp || "127.0.0.1";

        // â”€â”€ Build HMAC token â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const hashStr = [
            this.merchantId,
            userIp,
            merchantOid,
            params.email,
            String(paymentAmount),
            "eft",         // payment_type (iframe=eft)
            "0",           // installment_count (no installments)
            "TL",          // currency
            this.testMode,
            "1",           // no_installment
        ].join("");

        const paytrToken = this.generateHash(hashStr + this.merchantSalt);

        // â”€â”€ Build request body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const body: Record<string, string> = {
            merchant_id: this.merchantId,
            user_ip: userIp,
            merchant_oid: merchantOid,
            email: params.email,
            payment_amount: String(paymentAmount),
            paytr_token: paytrToken,
            user_basket: userBasket,
            debug_on: this.testMode === "1" ? "1" : "0",
            no_installment: "1",
            max_installment: "0",
            currency: "TL",
            test_mode: this.testMode,
            merchant_ok_url: params.successUrl,
            merchant_fail_url: params.cancelUrl,
        };

        // â”€â”€ Card storage (CAPI) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (params.storeCard) {
            body.store_card = "1";
        }
        if (params.userToken) {
            body.utoken = params.userToken;
        }
        if (params.savedCardToken) {
            body.ctoken = params.savedCardToken;
        }

        // â”€â”€ POST to PayTR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const formBody = new URLSearchParams(body);
        const response = await fetch(PAYTR_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody.toString(),
        });

        const result: PayTRTokenResponse = await response.json();

        if (result.status !== "success" || !result.token) {
            throw new Error(`PayTR token error: ${result.reason || "Unknown error"}`);
        }

        return {
            type: "iframe",
            iframeToken: result.token,
            sessionId: merchantOid,
        };
    }

    /**
     * Verify PayTR callback hash and extract payment result.
     *
     * PayTR sends POST to our callback URL with:
     * - merchant_oid, status, total_amount, hash
     * - Optionally: ctoken, utoken (if card was stored)
     *
     * We must respond with "OK" on success.
     */
    async verifyCallback(payload: Record<string, string>): Promise<CallbackResult> {
        const { merchant_oid, status, total_amount, hash } = payload;

        if (!merchant_oid || !status || !total_amount || !hash) {
            return { success: false, error: "Missing callback parameters" };
        }

        // â”€â”€ Verify HMAC hash â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const expectedHash = this.generateHash(
            merchant_oid + this.merchantSalt + status + total_amount
        );

        if (hash !== expectedHash) {
            return { success: false, error: "Hash verification failed" };
        }

        if (status !== "success") {
            return {
                success: false,
                merchantOid: merchant_oid,
                error: `Payment failed with status: ${status}`,
            };
        }

        // â”€â”€ Extract card storage tokens if present â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const result: CallbackResult = {
            success: true,
            merchantOid: merchant_oid,
            sessionId: merchant_oid,
        };

        if (payload.ctoken) {
            result.cardToken = payload.ctoken;
        }
        if (payload.utoken) {
            result.userToken = payload.utoken;
        }
        if (payload.last4) {
            result.last4 = payload.last4;
        }
        if (payload.card_brand) {
            result.brand = payload.card_brand.toLowerCase();
        }

        return result;
    }

    /**
     * PayTR refund via their API.
     * Note: PayTR refund API requires a separate integration.
     * For now, this is a placeholder â€” full refund requires PayTR panel or API call.
     */
    async refund(merchantOid: string, amountInKurus: number): Promise<RefundResult> {
        try {
            const hashStr = this.merchantId + merchantOid + String(amountInKurus) + this.merchantSalt;
            const paytrToken = this.generateHash(hashStr);

            const body = new URLSearchParams({
                merchant_id: this.merchantId,
                merchant_oid: merchantOid,
                return_amount: String(amountInKurus),
                paytr_token: paytrToken,
            });

            const response = await fetch("https://www.paytr.com/odeme/iade", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString(),
            });

            const result = await response.json();

            if (result.status === "success") {
                return { success: true, refundId: `paytr_refund_${merchantOid}` };
            }

            return { success: false, error: result.err_msg || "PayTR refund failed" };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private generateHash(data: string): string {
        return crypto
            .createHmac("sha256", this.merchantKey)
            .update(data)
            .digest("base64");
    }
}
