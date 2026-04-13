"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Phone, CheckCircle2, Loader2 } from "lucide-react";

interface PhoneVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void;
}

export function PhoneVerificationModal({
  open,
  onOpenChange,
  onVerified,
}: PhoneVerificationModalProps) {
  const { update: updateSession } = useSession();

  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // â”€â”€ Countdown timer â”€â”€
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // â”€â”€ Cleanup recaptcha on unmount â”€â”€
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaRef.current = null;
      }
    };
  }, []);

  // â”€â”€ Reset state when modal opens/closes â”€â”€
  useEffect(() => {
    if (!open) {
      setStep("phone");
      setOtp("");
      setLoading(false);
      setCountdown(0);
      confirmationRef.current = null;
    }
  }, [open]);

  // â”€â”€ Initialize invisible reCAPTCHA â”€â”€
  const initRecaptcha = useCallback(() => {
    if (recaptchaRef.current) return;

    recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved â€” will proceed with SMS
      },
      "expired-callback": () => {
        toast.error("reCAPTCHA süresi doldu, tekrar deneyin.");
        recaptchaRef.current = null;
      },
    });
  }, []);

  // â”€â”€ Format phone for Turkey â”€â”€
  const formatPhone = (raw: string) => {
    let cleaned = raw.replace(/\s/g, "").replace(/[^\d+]/g, "");
    if (cleaned.startsWith("0")) cleaned = "+90" + cleaned.slice(1);
    if (!cleaned.startsWith("+")) cleaned = "+90" + cleaned;
    return cleaned;
  };

  // â”€â”€ Step 1: Send SMS â”€â”€
  const handleSendSMS = async () => {
    const formatted = formatPhone(phoneNumber);
    if (!/^\+90\d{10}$/.test(formatted)) {
      toast.error("Geçerli bir Türkiye telefon numarası girin. Örnek: 05XX XXX XX XX");
      return;
    }

    setLoading(true);
    try {
      initRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        formatted,
        recaptchaRef.current!
      );

      confirmationRef.current = confirmation;
      setStep("otp");
      setCountdown(60);
      toast.success("Doğrulama kodu gönderildi!");
    } catch (error: any) {
      console.error("[PhoneVerify] SMS error:", error);

      if (error?.code === "auth/too-many-requests") {
        toast.error("Çok fazla deneme. Lütfen birkaç dakika bekleyin.");
      } else if (error?.code === "auth/invalid-phone-number") {
        toast.error("Geçersiz telefon numarası formatı.");
      } else {
        toast.error("SMS gönderilemedi. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ Step 2: Verify OTP + Backend call â”€â”€
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("6 haneli kodu girin.");
      return;
    }

    if (!confirmationRef.current) {
      toast.error("Doğrulama oturumu bulunamadı. Tekrar SMS gönderin.");
      setStep("phone");
      return;
    }

    setLoading(true);
    try {
      // Verify with Firebase client
      const result = await confirmationRef.current.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Send to our backend for SSOT verification
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Doğrulama başarısız.");
      }

      // Refresh NextAuth session to reflect new state
      await updateSession();

      setStep("success");
      toast.success(
        data.tokensGranted
          ? `Telefon doğrulandı! ğŸ‰ ${data.tokensGranted} hediye token hesabınıza eklendi.`
          : "Telefon numaranız doğrulandı! âœ…"
      );

      onVerified?.();

      // Auto-close after success
      setTimeout(() => onOpenChange(false), 2500);
    } catch (error: any) {
      console.error("[PhoneVerify] OTP error:", error);

      if (error?.code === "auth/invalid-verification-code") {
        toast.error("Yanlış kod. Tekrar deneyin.");
      } else if (error?.code === "auth/code-expired") {
        toast.error("Doğrulama kodunun süresi doldu. Yeni kod gönderin.");
        setStep("phone");
      } else {
        toast.error(error.message || "Doğrulama başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Telefon Doğrulama
          </DialogTitle>
          <DialogDescription>
            Hesabınızı güvence altına alın ve 15 hediye token kazanın.
          </DialogDescription>
        </DialogHeader>

        {/* â”€â”€ Phone Input Step â”€â”€ */}
        {step === "phone" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="phone-input">Telefon Numarası</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone-input"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Türkiye cep telefonu numaranızı girin.
              </p>
            </div>
            <Button
              onClick={handleSendSMS}
              disabled={loading || !phoneNumber.trim()}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              SMS Gönder
            </Button>
          </div>
        )}

        {/* â”€â”€ OTP Input Step â”€â”€ */}
        {step === "otp" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="otp-input">Doğrulama Kodu</Label>
              <Input
                id="otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="6 haneli kod"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {formatPhone(phoneNumber)} numarasına gönderilen 6 haneli kodu girin.
              </p>
            </div>
            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Doğrula
            </Button>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
                disabled={loading}
              >
                â† Numarayı Değiştir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSendSMS}
                disabled={loading || countdown > 0}
              >
                {countdown > 0 ? `Tekrar gönder (${countdown}s)` : "Tekrar Gönder"}
              </Button>
            </div>
          </div>
        )}

        {/* â”€â”€ Success Step â”€â”€ */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <p className="text-lg font-semibold text-center">
              Telefon numaranız başarıyla doğrulandı!
            </p>
            <p className="text-sm text-muted-foreground text-center">
              15 hediye token hesabınıza tanımlandı.
            </p>
          </div>
        )}

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" ref={recaptchaContainerRef} />
      </DialogContent>
    </Dialog>
  );
}
