import crypto from "crypto";
import type {
    PaymentGateway,
    CreateSessionParams,
    SessionResult,
    CallbackResult,
    RefundResult,
} from "../payment-gateway";

export interface IyzicoCallbackPayload {
    token: string;
}

/**
 * Iyzico Checkout Form Gateway (Redirect Method)
 * 
 * Flow:
 * 1. Server -> POST /payment/iyzipay/checkoutform/initialize -> Token + PaymentPageUrl
 * 2. Server -> Return Redirect URL to Client
 * 3. Client -> Redirects user to Iyzico
 * 4. Iyzico -> POST to our callbackUrl with 'token'
 * 5. Server -> POST /payment/iyzipay/checkoutform/auth/eic -> Verify payment
 */
export class IyzicoGateway implements PaymentGateway {
    readonly provider = "iyzico" as const;

    private apiKey: string;
    private secretKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.IYZICO_API_KEY || "";
        this.secretKey = process.env.IYZICO_SECRET_KEY || "";
        this.baseUrl = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

        if (!this.apiKey || !this.secretKey) {
            console.warn("[IyzicoGateway] Iyzico credentials not fully configured");
        }
    }

    async createSession(params: CreateSessionParams): Promise<SessionResult> {
        const conversationId = params.internalTxId;
        const buyerName = params.email.split('@')[0] || "User";

        const body = {
            locale: "tr",
            conversationId: conversationId,
            price: params.amountTRY.toString(),
            paidPrice: params.amountTRY.toString(),
            currency: "TRY",
            basketId: conversationId,
            paymentGroup: "PRODUCT",
            callbackUrl: process.env.IYZICO_CALLBACK_URL || "http://localhost:3000/api/iyzico/callback",
            enabledInstallments: [1],
            buyer: {
                id: params.userId,
                name: buyerName,
                surname: "User",
                identityNumber: "11111111111", // Default for testing if not provided
                email: params.email,
                registrationAddress: "N/A",
                city: "Istanbul",
                country: "Turkey",
                ip: (params as any).userIp || "127.0.0.1"
            },
            shippingAddress: {
                contactName: buyerName,
                city: "Istanbul",
                country: "Turkey",
                address: "N/A"
            },
            billingAddress: {
                contactName: buyerName,
                city: "Istanbul",
                country: "Turkey",
                address: "N/A"
            },
            basketItems: [
                {
                    id: params.packageId,
                    name: `${params.credits} Kredi Paketi`,
                    category1: "Credits",
                    itemType: "VIRTUAL",
                    price: params.amountTRY.toString()
                }
            ]
        };

        const headers = this.generateHeaders(body, "/payment/iyzipay/checkoutform/initialize");

        const response = await fetch(`${this.baseUrl}/payment/iyzipay/checkoutform/initialize`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(`Iyzico initialization failed: ${result.errorMessage || "Unknown error"}`);
        }

        return {
            type: "redirect",
            url: result.paymentPageUrl,
            sessionId: result.token // Token used to identify the session in callback
        };
    }

    async verifyCallback(payload: unknown): Promise<CallbackResult> {
        const { token } = payload as IyzicoCallbackPayload;
        if (!token) return { success: false, error: "Missing token in callback" };

        const body = {
            locale: "tr",
            conversationId: `verify_${Date.now()}`,
            token: token
        };

        const headers = this.generateHeaders(body, "/payment/iyzipay/checkoutform/auth/eic");

        const response = await fetch(`${this.baseUrl}/payment/iyzipay/checkoutform/auth/eic`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.status !== "success" || result.paymentStatus !== "SUCCESS") {
            return {
                success: false,
                error: result.errorMessage || "Payment verification failed",
                sessionId: token
            };
        }

        return {
            success: true,
            sessionId: token,
            merchantOid: result.basketId, // We use basketId as our internalTxId/merchantOid
            credits: result.price, // Not used directly but available
            brand: result.cardFamily?.toLowerCase(),
            last4: result.lastFourDigits
        };
    }

    async refund(merchantOid: string, amountInKurus: number): Promise<RefundResult> {
        // Iyzico refund requires the 'paymentTransactionId' from the original successful payment.
        // This would require storing that ID in the Transaction metadata.
        // For now, placeholder as requested.
        return { success: false, error: "Iyzico refund requires paymentTransactionId storage" };
    }

    // ── PKI Hash Generator ──────────────────────────────────────────────

    private generateHeaders(body: Record<string, unknown>, urlPath: string) {
        const rnd = Date.now().toString();
        const pkiString = this.generatePkiString(body);
        const hashStr = this.apiKey + rnd + this.secretKey + pkiString;
        const hash = crypto.createHash("sha1").update(hashStr).digest("base64");

        return {
            "x-iyzi-rnd": rnd,
            "x-iyzi-auth-v2": `IYZWSv2 ${this.apiKey}:${hash}`,
            "Authorization": `IYZWSv2 ${this.apiKey}:${hash}` // Some older systems might expect this
        };
    }

    private generatePkiString(obj: unknown): string {
        if (typeof obj !== "object" || obj === null) {
            return String(obj);
        }
        // Recursive PKI string generator following Iyzico's exact rules
        let pki = "[";
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
            const val = (obj as Record<string, unknown>)[key];
            if (val === null || val === undefined) continue;

            pki += key + "=";
            if (Array.isArray(val)) {
                pki += "[";
                // Array elements are also sorted/processed if they are objects
                for (const item of val) {
                    if (typeof item === "object") {
                        pki += this.generatePkiString(item);
                    } else {
                        pki += item;
                    }
                    pki += ", ";
                }
                if (val.length > 0) pki = pki.slice(0, -2); // remove last comma
                pki += "]";
            } else if (typeof val === "object") {
                pki += this.generatePkiString(val);
            } else {
                pki += val;
            }
            pki += ",";
        }
        if (keys.length > 0) pki = pki.slice(0, -1);
        pki += "]";
        return pki;
    }
}
