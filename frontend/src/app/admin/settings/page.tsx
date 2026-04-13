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
import { PackageManager } from "@/components/admin/package-manager";

export default function AdminSettingsPage() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Admin Ayarları</h1>

            {/* Global Credit Package Management */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Kredi Paket Yönetimi</CardTitle>
                    <CardDescription>Veritabanındaki tüm kredi paketlerini görüntüleyin ve fiyatlarını güncelleyin</CardDescription>
                </CardHeader>
                <CardContent>
                    <PackageManager />
                </CardContent>
            </Card>

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

            {/* Notifications */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Bildirimler</CardTitle>
                    <CardDescription>Bildirim tercihlerinizi yönetin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Anlık Bildirimler</Label>
                            <p className="text-sm text-muted-foreground">
                                Önemli güncellemeler hakkında bildirim alın
                            </p>
                        </div>
                        <Switch
                            checked={notifications}
                            onCheckedChange={setNotifications}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>E-posta Bültenleri</Label>
                            <p className="text-sm text-muted-foreground">
                                Haftalık özet ve kampanya bildirimleri
                            </p>
                        </div>
                        <Switch
                            checked={marketingEmails}
                            onCheckedChange={setMarketingEmails}
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
