"use client";

import { useState } from "react";
import { Mail, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function EmailCampaignsPage() {
    const [targetAudience, setTargetAudience] = useState<string>("");
    const [subject, setSubject] = useState("");
    const [htmlContent, setHtmlContent] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!targetAudience || !subject.trim() || !htmlContent.trim()) {
            toast.error("Lütfen tüm alanları doldurun.");
            return;
        }

        if (!confirm("E-posta kampanyasını başlatmak istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
            return;
        }

        setIsSending(true);

        try {
            const res = await fetch("/api/admin/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetAudience, subject, htmlContent }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gönderim başarısız");
            }

            toast.success(data.message || "Kampanya başarıyla gönderildi!");
            setSubject("");
            setHtmlContent("");
            setTargetAudience("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Mail className="w-8 h-8 text-primary" />
                    E-Posta Kampanyaları
                </h1>
                <p className="text-muted-foreground text-lg">
                    Abonelerinize, rehberlere veya tüm kullanıcılara Resend altyapısı üzerinden toplu e-posta gönderin.
                </p>
            </div>

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>Yeni Kampanya Oluştur</CardTitle>
                    <CardDescription>
                        Gönderilecek hedef kitleyi ve içeriği belirleyin. E-postalar arka planda işlenerek iletilecektir.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="audience">Hedef Kitle</Label>
                            <Select value={targetAudience} onValueChange={setTargetAudience}>
                                <SelectTrigger id="audience">
                                    <SelectValue placeholder="Hedef kitle seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBSCRIBERS">Sadece Bülten Aboneleri</SelectItem>
                                    <SelectItem value="GUIDES">Rehberler ve Acenteler</SelectItem>
                                    <SelectItem value="ALL_USERS">Tüm Kullanıcılar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">E-Posta Konusu</Label>
                            <Input
                                id="subject"
                                placeholder="Örn: Yeni Özelliklerimiz Yayında!"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">HTML İçerik</Label>
                            <Textarea
                                id="content"
                                placeholder="E-posta HTML içeriğinizi buraya yapıştırın..."
                                className="min-h-[250px] font-mono text-sm"
                                value={htmlContent}
                                onChange={(e) => setHtmlContent(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Gelişmiş tasarım için HTML etiketleri kullanabilirsiniz (ör. &lt;h1&gt;, &lt;strong&gt;, &lt;p&gt;).
                            </p>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isSending} 
                            className="w-full sm:w-auto"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Kampanyayı Başlat
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
