import { Metadata } from "next";
import { Gavel } from "lucide-react";
import { TermsContent } from "@/components/policies-content";

export const metadata: Metadata = {
    title: "Kullanım Koşulları | Umrebuldum",
    description: "Umrebuldum platformunu kullanırken uymanız gereken kurallar, kullanıcı yükümlülükleri ve yasal sorumluluklar.",
};

export default function TermsPage() {
    return (
        <div className="container py-16 md:py-24 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                    <Gavel className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Kullanım Koşulları
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Platformumuzu güvenli ve yasal bir çerçevede kullanabilmeniz için lütfen işbu koşulları dikkatlice okuyunuz.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-3xl border border-border shadow-sm">
                <TermsContent />
            </div>
        </div>
    );
}
