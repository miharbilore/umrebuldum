import { Metadata } from "next"
import { Copyleft } from "lucide-react"
import { RefundPolicyContent } from "@/components/policies-content"

export const metadata: Metadata = {
    title: "İade ve İptal Politikası | Umrebuldum",
    description:
        "Umrebuldum platformu üzerinden satın alınan üyelik paketleri ve ilan edilen tur rezervasyonlarının iptal koşulları hakkında bilgi.",
}

export default function RefundPolicyPage() {
    return (
        <div className="container py-16 md:py-24 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                    <Copyleft className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    İade ve İptal Politikası
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Acentelerimiz için platform abonelik iptalleri ve misafirlerimiz için tur paketlerine dair yasal sorumluluk reddi beyanımızı içerir.
                </p>
                <div className="text-sm text-muted-foreground">Son Güncelleme: 9 Mart 2026</div>
            </div>

            <div className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-3xl border border-border shadow-sm">
                <RefundPolicyContent />
            </div>
        </div>
    )
}
