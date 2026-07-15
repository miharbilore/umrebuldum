"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PaymentCheckoutProps {
  packageId: string;
  packageName: string;
  amountTRY: number;
  credits: number;
  discountedAmount?: number;
  couponCode?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PaymentCheckout({ packageId, amountTRY, packageName, credits, discountedAmount, couponCode, onClose, onSuccess }: PaymentCheckoutProps) {
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPaytrToken() {
      try {
        // Compute final price based on discount
        const price = discountedAmount !== undefined ? discountedAmount : amountTRY;
        
        const res = await fetch("/api/paytr/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId, price, packageName, credits, couponCode }),
        });
        
        const data = await res.json();
        
        if (data.token) {
          setIframeToken(data.token);
        } else {
          toast.error(data.error || "Ödeme başlatılamadı.");
        }
      } catch (error) {
        toast.error("Sistemsel bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaytrToken();
  }, [packageId, amountTRY, discountedAmount, packageName, credits, couponCode]);

  if (isLoading) return <div className="p-8 text-center animate-pulse">Güvenli Ödeme Altyapısı Yükleniyor...</div>;

  if (!iframeToken) return <div className="p-8 text-center text-red-500">Ödeme altyapısına bağlanılamadı.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl border border-gray-200">
      <iframe
        src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
        id="paytriframe"
        style={{ width: "100%", height: "600px", border: "0" }}
        title="PayTR Güvenli Ödeme Sayfası"
      />
    </div>
  );
}
