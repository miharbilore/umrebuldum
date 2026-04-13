"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Bir hata oluştu.");
            }

            setSent(true);
            toast.success("Şifre sıfırlama bağlantısı gönderildi!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-10 dark:bg-gray-950">
            <Card className="w-full max-w-md shadow-lg border-muted/40">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Şifremi Unuttum
                    </CardTitle>
                    <CardDescription>
                        {sent
                            ? "E-posta adresinize şifre sıfırlama bağlantısı gönderildi."
                            : "Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sent ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    <strong>{email}</strong> adresine bir şifre sıfırlama bağlantısı gönderdik.
                                    Lütfen e-posta kutunuzu kontrol edin.
                                </p>
                                <p className="text-xs text-muted-foreground text-center">
                                    E-posta gelmediyse spam/gereksiz klasörünüzü kontrol edin.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => { setSent(false); setEmail(""); }}
                            >
                                Tekrar Gönder
                            </Button>
                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Giriş sayfasına dön
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta Adresi</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Şifre Sıfırlama Bağlantısı Gönder
                            </Button>
                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Giriş sayfasına dön
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
