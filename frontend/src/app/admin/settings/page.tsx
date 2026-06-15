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
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
    const { data: session } = useSession();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                if (data.maintenance_mode === "true") {
                    setMaintenanceMode(true);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const toggleMaintenanceMode = async (checked: boolean) => {
        setMaintenanceMode(checked);
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    key: "maintenance_mode", 
                    value: checked ? "true" : "false",
                    description: "Site bakım moduna alınırsa, adminler hariç herkes engellenir."
                })
            });
            if (res.ok) {
                toast.success(checked ? "Bakım Modu AKTİF!" : "Bakım Modu KAPALI.");
            } else {
                toast.error("Ayarlar kaydedilemedi.");
                setMaintenanceMode(!checked); // revert
            }
        } catch (e) {
            toast.error("Bağlantı hatası");
            setMaintenanceMode(!checked); // revert
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Admin Ayarları</h1>

            {/* Profile Info */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Profil Bilgileri</CardTitle>
                    <CardDescription>Hesap bilgilerinizi görüntüleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ad Soyad</Label>
                            <Input value={session?.user?.name || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>E-posta</Label>
                            <Input value={session?.user?.email || ""} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Settings */}
            <Card className="mb-6 border-red-100">
                <CardHeader className="bg-red-50/50 rounded-t-lg pb-4 border-b border-red-100">
                    <CardTitle className="text-red-800 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        Kritik Sistem Ayarları
                    </CardTitle>
                    <CardDescription>Sitenin yayında kalmasını etkileyen ana şalterler</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-lg font-semibold flex items-center gap-2">
                                Bakım Modu (Maintenance Mode)
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Açıldığında siteye sadece "Admin" rolündeki yöneticiler girebilir. Tüm müşteriler ve rehberler "Sistem Bakımda" uyarı sayfasıyla karşılaşır.
                            </p>
                        </div>
                        <Switch
                            checked={maintenanceMode}
                            onCheckedChange={toggleMaintenanceMode}
                            disabled={loading || saving}
                            className="data-[state=checked]:bg-red-600 scale-125"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Security - Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle>Güvenlik</CardTitle>
                    <CardDescription>Şifrenizi değiştirin</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
