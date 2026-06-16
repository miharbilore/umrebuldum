"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Bir Sorun Oluştu</h1>
                <p className="text-slate-500 text-sm">
                    Bu sayfayı yüklerken beklenmeyen bir hata ile karşılaştık. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <Button onClick={() => reset()} className="w-full min-h-12 text-base rounded-xl bg-amber-500 hover:bg-amber-600">
                    Tekrar Dene
                </Button>
                <Button asChild variant="outline" className="w-full min-h-12 text-base rounded-xl">
                    <Link href="/">Ana Sayfaya Dön</Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
