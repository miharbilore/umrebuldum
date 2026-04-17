"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [notifications, setNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [contactConsent, setContactConsent] = useState(false);
    const [phone, setPhone] = useState("");
    const [savingPhone, setSavingPhone] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setContactConsent(Boolean(data.contactConsent));
                    setPhone(data.phone || "");
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSavePhone = async () => {
        if (!phone.trim()) {
            toast.error("Telefon numarası boş bırakılamaz.");
            return;
        }
        setSavingPhone(true);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            if (res.ok) {
                await update(); // Refresh session to globally reflect change
                toast.success("Telefon numarası başarıyla güncellendi.");
            } else {
                toast.error("Telefon numarası güncellenemedi.");
            }
        } catch {
            toast.error("Bağlantı hatası.");
        } finally {
            setSavingPhone(false);
        }
    };

    const handleSave = () => {
        toast.success("Ayarlar kaydedildi.");
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Ayarlar</h1>

            <div className="space-y-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hesap Bilgileri</CardTitle>
                        <CardDescription>Sisteme giriş yaptığınız ve iletişim için kullandığınız temel bilgileriniz.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Ad Soyad / Kurum Adı</Label>
                            <Input defaultValue={session?.user?.name || ""} disabled />
                            <p className="text-xs text-muted-foreground">İsim değişikliği için destek ekibiyle iletişime geçin.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>E-posta</Label>
                            <Input defaultValue={session?.user?.email || ""} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Telefon Numarası</Label>
                            <div className="flex gap-2">
                                <Input 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    placeholder="5XX XXX XX XX"
                                    disabled={loading}
                                />
                                <Button 
                                    onClick={handleSavePhone} 
                                    disabled={savingPhone || loading}
                                    variant="secondary"
                                >
                                    {savingPhone ? "Kaydediliyor..." : "Güncelle"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bildirimler</CardTitle>
                        <CardDescription>Hangi durumlarda bildirim almak istediğinizi seçin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Yeni Talep Bildirimleri</Label>
                                <p className="text-sm text-muted-foreground">Yeni bir müşteri talebi geldiğinde bildirim al.</p>
                            </div>
                            <Switch checked={notifications} onCheckedChange={setNotifications} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Kampanya ve Duyurular</Label>
                                <p className="text-sm text-muted-foreground">Platform güncellemeleri hakkında e-posta al.</p>
                            </div>
                            <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gizlilik ve İletişim</CardTitle>
                        <CardDescription>Rehberlerin sizinle iletişim kurma tercihlerini yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start justify-between space-x-4">
                            <div className="space-y-1">
                                <Label>İletişim Bilgilerimi Paylaş</Label>
                                <p className="text-sm text-muted-foreground">
                                    Bu seçeneği açarak, talep oluşturduğunuz turların rehberlerinin sizi aramasına veya mesaj atmasına izin verirsiniz.
                                    Kapalı tutarsanız iletişim sadece bu platform üzerinden sağlanır.
                                </p>
                                <div className="mt-2 text-xs text-blue-600">
                                    <a href="/kvkk" target="_blank" className="hover:underline">
                                        Kişisel Verilerin Korunması (KVKK) metnini okumak için tıklayın.
                                    </a>
                                </div>
                            </div>
                            <Switch
                                id="contact-consent"
                                checked={contactConsent}
                                onCheckedChange={async (checked) => {
                                    setContactConsent(checked);
                                    try {
                                        const res = await fetch('/api/user/settings', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ contactConsent: checked })
                                        });
                                        if (res.ok) {
                                            await update(); // Refresh session to reflect change
                                            toast.success("Tercihiniz güncellendi.");
                                        } else {
                                            setContactConsent(!checked); // Revert on failure
                                            toast.error("Güncelleme başarısız.");
                                        }
                                    } catch {
                                        setContactConsent(!checked); // Revert on error
                                        toast.error("Bağlantı hatası.");
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Password / Security */}
                <Card>
                    <CardHeader>
                        <CardTitle>Güvenlik</CardTitle>
                        <CardDescription>Şifrenizi ve hesap güvenliğinizi yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Değişiklikleri Kaydet
                    </Button>
                </div>
            </div>
        </div>
    );
}
