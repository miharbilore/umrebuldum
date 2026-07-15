"use client";

import { CreditCard, ShieldCheck } from "lucide-react";

export function SavedCards() {
    return (
        <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Kayıtlı kart özelliği devre dışı bırakılmıştır.</p>
            <p className="text-gray-400 text-xs mt-1">
                Tüm işlemleriniz %100 Güvenli Ödeme altyapısı PayTR üzerinden gerçekleştirilmektedir.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4 px-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Kart bilgileriniz sunucularımızda saklanmaz.</span>
            </div>
        </div>
    );
}
