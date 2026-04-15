"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    CreditCard,
    Loader2,
    ShieldCheck,
    Lock,
    Globe,
    Landmark,
    X,
} from "lucide-react";

interface PaymentCheckoutProps {
    packageId: string;
    packageName: string;
    amountTRY: number;
    credits: number;
    discountedAmount?: number;
    couponCode?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

type ProviderTab = "paytr" | "stripe";

/**
 * PaymentCheckout — Modern payment modal with Stripe / PayTR toggle.
 *
 * - Stripe: Redirects to hosted Checkout page
 * - PayTR: Embeds iFrame within this component
 * - Visa/Mastercard/Troy logos + 3D Secure badge
 * - PCI-DSS SAQ-A compliant (no card data on our servers)
 */
export function PaymentCheckout({
    packageId,
    packageName,
    amountTRY,
    credits,
    discountedAmount,
    couponCode,
    onClose,
    onSuccess,
}: PaymentCheckoutProps) {
    const [availableProviders, setAvailableProviders] = useState<string[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<ProviderTab>("paytr");
    const [loading, setLoading] = useState(false);
    const [iframeToken, setIframeToken] = useState<string | null>(null);

    const finalAmount = discountedAmount ?? amountTRY;

    // Fetch available providers on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/billing/checkout");
                if (res.ok) {
                    const data = await res.json();
                    setAvailableProviders(data.providers || ["stripe"]);
                    if (!data.providers?.includes("paytr")) {
                        setSelectedProvider("stripe");
                    }
                }
            } catch {
                setAvailableProviders(["stripe"]);
                setSelectedProvider("stripe");
            }
        })();
    }, []);

    // Listen for PayTR iframe postMessage (success/fail)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin === "https://www.paytr.com") {
                if (event.data === "payment_success") {
                    toast.success("Ödeme başarılı! Kredileriniz hesabınıza tanımlandı.");
                    onSuccess?.();
                    onClose();
                } else if (event.data === "payment_fail") {
                    toast.error("Ödeme başarısız. Lütfen tekrar deneyin.");
                    setIframeToken(null);
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onClose, onSuccess]);

    const handlePayment = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId,
                    provider: selectedProvider,
                    ...(couponCode ? { couponCode } : {}),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Ödeme başlatılamadı.");
                setLoading(false);
                return;
            }

            const data = await res.json();

            if (data.provider === "stripe" && data.url) {
                // Stripe: redirect to hosted page
                window.location.href = data.url;
                return;
            }

            if (data.iframeToken) {
                // PayTR: embed iframe
                setIframeToken(data.iframeToken);
                setLoading(false);
                return;
            }

            if (data.url) {
                // Dev bypass or other redirect
                window.location.href = data.url;
                return;
            }

            toast.error("Ödeme başlatılamadı.");
            setLoading(false);
        } catch {
            toast.error("Bir hata oluştu.");
            setLoading(false);
        }
    }, [packageId, selectedProvider, couponCode]);

    const hasPayTR = availableProviders.includes("paytr");
    const hasStripe = availableProviders.includes("stripe");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Güvenli Ödeme</h2>
                            <p className="text-white/60 text-xs">PCI DSS Level 1 Uyumlu • 3D Secure</p>
                        </div>
                    </div>

                    {/* Card brand logos */}
                    <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                            <div className="w-8 h-5 rounded bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                            <div className="w-8 h-5 rounded bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                                <div className="flex -space-x-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                                </div>
                            </div>
                            {hasPayTR && (
                                <div className="w-8 h-5 rounded bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-[7px] font-bold text-white">TROY</div>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-white/50 text-[10px]">
                            <Lock className="h-3 w-3" />
                            <span>256-bit SSL</span>
                        </div>
                    </div>
                </div>

                {/* Provider Tabs */}
                {hasPayTR && hasStripe && !iframeToken && (
                    <div className="px-6 pt-5">
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setSelectedProvider("paytr")}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                                    ${selectedProvider === "paytr"
                                        ? "bg-white shadow-sm text-slate-900"
                                        : "text-slate-500 hover:text-slate-700"
                                    }
                                `}
                            >
                                <Landmark className="h-4 w-4" />
                                <span>Türk Kartı</span>
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold">PayTR</span>
                            </button>
                            <button
                                onClick={() => setSelectedProvider("stripe")}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                                    ${selectedProvider === "stripe"
                                        ? "bg-white shadow-sm text-slate-900"
                                        : "text-slate-500 hover:text-slate-700"
                                    }
                                `}
                            >
                                <Globe className="h-4 w-4" />
                                <span>Global Kart</span>
                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full font-semibold">Stripe</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* PayTR iFrame */}
                {iframeToken && (
                    <div className="px-6 pt-4">
                        <iframe
                            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                            id="paytr-iframe"
                            frameBorder="0"
                            scrolling="yes"
                            className="w-full rounded-xl border"
                            style={{ height: "460px" }}
                        />
                    </div>
                )}

                {/* Order Summary */}
                <div className="px-6 py-4">
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{packageName}</span>
                            <span className="text-sm font-medium text-gray-900">{credits} Kredi</span>
                        </div>
                        {discountedAmount && discountedAmount < amountTRY && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Orijinal Fiyat</span>
                                <span className="text-gray-400 line-through">{amountTRY.toLocaleString("tr-TR")} ₺</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-sm font-bold text-gray-900">Toplam</span>
                            <span className="text-xl font-extrabold text-gray-900">
                                {Math.round(finalAmount).toLocaleString("tr-TR")} ₺
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pay Button */}
                {!iframeToken && (
                    <div className="px-6 pb-6">
                        <Button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20 rounded-xl transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    İşleniyor...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    🔑’ Güvenli Ödeme Yap
                                </>
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <ShieldCheck className="h-3 w-3" />
                                <span>3D Secure Korumalı</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="text-[10px] text-gray-400">
                                {selectedProvider === "paytr" ? "Powered by PayTR™" : "Powered by Stripe™"}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
