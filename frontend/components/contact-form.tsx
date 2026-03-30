"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const firstName = formData.get("firstName")?.toString().trim() || "";
        const lastName = formData.get("lastName")?.toString().trim() || "";
        const email = formData.get("email")?.toString().trim() || "";
        const phone = formData.get("phone")?.toString().trim() || "";
        const message = formData.get("message")?.toString().trim() || "";

        // Client-side Validation (Security Check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d+$/;

        if (!emailRegex.test(email)) {
            toast.error("Lütfen geçerli bir E-posta adresi girin.");
            setLoading(false);
            return;
        }

        if (phone && !phoneRegex.test(phone)) {
            toast.error("Telefon numarası sadece rakam içerebilir.");
            setLoading(false);
            return;
        }

        if (message.length > 240) {
            toast.error("Mesajınız en fazla 240 karakter olabilir.");
            setLoading(false);
            return;
        }

        const data = { firstName, lastName, email, phone, message };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const resData = await res.json();

            if (!res.ok) {
                throw new Error(resData.error || "Gönderilemedi");
            }

            toast.success("Mesajınız alınmıştır! En kısa sürede size döneceğiz.");
            form.reset();
        } catch (err: any) {
            toast.error(err.message || "Bir sorun oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-lg">Ad</Label>
                    <Input id="firstName" name="firstName" placeholder="Adınız" className="h-14 text-lg" required maxLength={50} />
                </div>
                <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-lg">Soyad</Label>
                    <Input id="lastName" name="lastName" placeholder="Soyadınız" className="h-14 text-lg" required maxLength={50} />
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="email" className="text-lg">E-posta</Label>
                <Input id="email" name="email" type="email" placeholder="ornek@email.com" className="h-14 text-lg" required maxLength={100} />
            </div>

            <div className="space-y-3">
                <Label htmlFor="phone" className="text-lg">Telefon (opsiyonel)</Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="05000000000"
                    className="h-14 text-lg"
                    maxLength={20}
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="message" className="text-lg">Mesajınız</Label>
                    <span className="text-xs text-muted-foreground">Maksimum 240 karakter</span>
                </div>
                <Textarea id="message" name="message" placeholder="Size nasıl yardımcı olabiliriz?" className="min-h-[180px] resize-none text-lg" required maxLength={240} />
            </div>

            <Button type="submit" size="lg" className="w-full h-16 text-xl font-semibold" disabled={loading}>
                {loading ? "Gönderiliyor..." : "Mesaj Gönder"}
            </Button>
        </form>
    );
}
