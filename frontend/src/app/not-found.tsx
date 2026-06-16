import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <SearchX className="w-10 h-10 text-slate-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Sayfa Bulunamadı</h1>
                <p className="text-slate-500 text-sm">
                    Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. Lütfen bağlantıyı kontrol edin.
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <Button asChild className="w-full min-h-12 text-base rounded-xl">
                    <Link href="/">Ana Sayfaya Dön</Link>
                </Button>
                <Button asChild variant="outline" className="w-full min-h-12 text-base rounded-xl">
                    <Link href="/tours">Turları İncele</Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
