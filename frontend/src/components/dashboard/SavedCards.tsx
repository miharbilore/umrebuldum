"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Trash2, Star, ShieldCheck } from "lucide-react";

interface SavedCard {
    id: string;
    provider: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
}

const BRAND_LOGOS: Record<string, { label: string; gradient: string }> = {
    visa: { label: "Visa", gradient: "from-blue-600 to-blue-800" },
    mastercard: { label: "Mastercard", gradient: "from-red-500 to-orange-500" },
    troy: { label: "Troy", gradient: "from-emerald-500 to-teal-600" },
    amex: { label: "Amex", gradient: "from-indigo-500 to-purple-600" },
    unknown: { label: "Kart", gradient: "from-gray-500 to-gray-700" },
};

export function SavedCards() {
    const [cards, setCards] = useState<SavedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchCards = async () => {
        try {
            const res = await fetch("/api/billing/saved-cards");
            if (res.ok) {
                setCards(await res.json());
            }
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const deleteCard = async (cardId: string) => {
        setActionLoading(cardId);
        try {
            const res = await fetch("/api/billing/saved-cards", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId }),
            });

            if (res.ok) {
                setCards((prev) => prev.filter((c) => c.id !== cardId));
                toast.success("Kart silindi.");
            } else {
                toast.error("Kart silinemedi.");
            }
        } catch {
            toast.error("Bir hata oluştu.");
        } finally {
            setActionLoading(null);
        }
    };

    const setDefault = async (cardId: string) => {
        setActionLoading(cardId);
        try {
            const res = await fetch("/api/billing/saved-cards", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId }),
            });

            if (res.ok) {
                setCards((prev) =>
                    prev.map((c) => ({ ...c, isDefault: c.id === cardId }))
                );
                toast.success("Varsayılan kart güncellendi.");
            }
        } catch {
            toast.error("Bir hata oluştu.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl" />
                ))}
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Kayıtlı kart bulunmuyor</p>
                <p className="text-gray-400 text-xs mt-1">
                    Ödeme sırasında &ldquo;Bu kartı sakla&rdquo; seçeneğini işaretleyerek kart kaydedebilirsiniz.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {cards.map((card) => {
                const brandInfo = BRAND_LOGOS[card.brand] || BRAND_LOGOS.unknown;

                return (
                    <div
                        key={card.id}
                        className={`
                            relative flex items-center justify-between p-4 rounded-xl border-2 transition-all
                            ${card.isDefault
                                ? "border-primary/40 bg-primary/5 shadow-sm"
                                : "border-gray-150 bg-white hover:border-gray-300"
                            }
                        `}
                    >
                        <div className="flex items-center gap-4">
                            {/* Card Brand Visual */}
                            <div className={`
                                w-14 h-9 rounded-md bg-gradient-to-r ${brandInfo.gradient}
                                flex items-center justify-center text-white text-[10px] font-bold
                                tracking-wider shadow-sm
                            `}>
                                {brandInfo.label}
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm text-gray-800 tracking-wider">
                                        •••• •••• •••• {card.last4}
                                    </span>
                                    {card.isDefault && (
                                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Varsayılan
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-400">
                                        {card.provider === "paytr" ? "PayTR" : "Stripe"}
                                    </span>
                                    {card.expiryMonth > 0 && (
                                        <span className="text-xs text-gray-400">
                                            {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {!card.isDefault && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-amber-500"
                                    onClick={() => setDefault(card.id)}
                                    disabled={actionLoading === card.id}
                                    title="Varsayılan yap"
                                >
                                    <Star className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                onClick={() => deleteCard(card.id)}
                                disabled={actionLoading === card.id}
                                title="Kartı sil"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2 px-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Kart bilgileriniz sunucularımızda saklanmaz. Sadece güvenli token kullanılır.</span>
            </div>
        </div>
    );
}
