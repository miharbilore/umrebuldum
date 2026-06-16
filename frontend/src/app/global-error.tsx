"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service like Sentry
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Kritik Bir Hata Oluştu</h1>
                    <p className="text-slate-500 text-sm">
                        Sistemde beklenmeyen bir sorun meydana geldi. Teknik ekibimiz durumdan haberdar edildi. Lütfen sayfayı yenilemeyi deneyin.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => reset()} className="w-full min-h-12 text-base rounded-xl">
                        Sayfayı Yenile
                    </Button>
                    <Button asChild variant="outline" className="w-full min-h-12 text-base rounded-xl">
                        <Link href="/">Ana Sayfaya Dön</Link>
                    </Button>
                </div>
            </div>
        </div>
      </body>
    </html>
  );
}
