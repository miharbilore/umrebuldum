"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useRouter } from "next/navigation";

export default function ProfileEditingPage() {
    const { data: session } = useSession();
    const role = session?.user?.role;
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        image: "",
        coverImage: "",
        bio: "",
        city: "",
        agencyCity: "",
        tursabNumber: "",
        establishmentYear: "",
        languagesSpoken: "", // Handled as comma separated for simple text input
        experienceYears: "",
        specialties: "", // Comma separated
        videoIntroduction: "",
    });

    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setFormData({
                        image: data.image || "",
                        coverImage: data.coverImage || "",
                        bio: data.bio || "",
                        city: data.city || "",
                        agencyCity: data.agencyCity || "",
                        tursabNumber: data.tursabNumber || "",
                        establishmentYear: data.establishmentYear || "",
                        languagesSpoken: (data.languagesSpoken || []).join(", "),
                        experienceYears: data.experienceYears || "",
                        specialties: (data.specialties || []).join(", "),
                        videoIntroduction: data.videoIntroduction || "",
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "coverImage") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadPromise = async () => {
            // 1. Get Presigned URL
            const res = await fetch('/api/upload/s3', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    folder: type === 'image' ? 'avatars' : 'covers'
                })
            });

            if (!res.ok) throw new Error("URL alınamadı");
            const { signedUrl, publicUrl } = await res.json();

            // 2. Upload to S3
            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadRes.ok) throw new Error("Yükleme başarısız");

            // 3. Update local state
            setFormData(prev => ({ ...prev, [type]: publicUrl }));
            
            return "Fotoğraf yüklendi";
        };

        toast.promise(uploadPromise(), {
            loading: 'Yükleniyor...',
            success: 'Fotoğraf başarıyla güncellendi.',
            error: 'Fotoğraf yüklenemedi.'
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                languagesSpoken: formData.languagesSpoken.split(",").map(s => s.trim()).filter(Boolean),
                specialties: formData.specialties.split(",").map(s => s.trim()).filter(Boolean),
            };

            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Profiliniz başarıyla güncellendi. Açık Profilinizde görünür olacaktır.");
                setTimeout(() => {
                    router.push(`/rehber/${session?.user?.id}-profil`);
                }, 1000);
            } else {
                toast.error("Güncelleme başarısız.");
            }
        } catch {
            toast.error("Bağlantı hatası.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const isOrganization = role === "ORGANIZATION";
    const isGuide = role === "GUIDE";

    return (
        <DashboardLayout>
            <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Profilimi Düzenle</h1>
                    <p className="text-muted-foreground mt-2">Dışarıya (Umrecilere) yansıyacak olan vitrin bilgilerinizi buradan düzenleyebilirsiniz.</p>
                </div>

                {/* Görsel Yükleme */}
                <Card>
                    <CardHeader>
                        <CardTitle>Görseller</CardTitle>
                        <CardDescription>Profilinizi daha güvenilir kılan yüksek kaliteli fotoğraflar seçin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Kapak Görseli */}
                        <div className="space-y-2">
                            <Label>Kapak Fotoğrafı</Label>
                            <div 
                                className="relative h-48 rounded-lg bg-slate-100 border border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-50 transition"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                {formData.coverImage ? (
                                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                                        <span className="text-sm">Kapak Görüntüsü Yükle (Önerilen: 1200x400)</span>
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-md backdrop-blur-sm shadow-sm text-xs flex items-center gap-2 hover:bg-black/70">
                                    <Camera className="w-4 h-4" /> Değiştir
                                </div>
                            </div>
                            <input type="file" className="hidden" ref={coverInputRef} onChange={(e) => handleUpload(e, 'coverImage')} accept="image/jpeg, image/png, image/webp" />
                        </div>

                        {/* Profil Resmi */}
                        <div className="flex items-center gap-6">
                            <div 
                                className="relative w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg flex-shrink-0 cursor-pointer overflow-hidden"
                                onClick={() => profileInputRef.current?.click()}
                            >
                                {formData.image ? (
                                    <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex items-center justify-center text-transparent hover:text-white">
                                    <Camera className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium">Profil Fotoğrafı / Kurum Logosu</h3>
                                <p className="text-sm text-muted-foreground mt-1">Yüzünüzü net gösteren veya kurumsal kimliğinizi yansıtan, güven verici bir görsel kullanın.</p>
                            </div>
                            <input type="file" className="hidden" ref={profileInputRef} onChange={(e) => handleUpload(e, 'image')} accept="image/jpeg, image/png, image/webp" />
                        </div>
                    </CardContent>
                </Card>

                {/* Temel Bilgiler */}
                <Card>
                    <CardHeader>
                        <CardTitle>Genel Hakkında</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Kısa Biyografi (Bio)</Label>
                            <Textarea 
                                rows={5}
                                placeholder="Kendinizden veya acentenizden kısaca bahsedin. Umrecilere ne gibi avantajlar sunduğunuzu açıklayın."
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bulunduğunuz Şehir</Label>
                                <Input 
                                    placeholder="Örn: İstanbul" 
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                />
                            </div>
                            {isOrganization && (
                                <div className="space-y-2">
                                    <Label>Bölge/Şube</Label>
                                    <Input 
                                        placeholder="Örn: Fatih Şubesi" 
                                        value={formData.agencyCity}
                                        onChange={(e) => setFormData({...formData, agencyCity: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Rehber / Acente Ekstra Bilgiler */}
                {(isGuide || isOrganization) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Mesleki Detaylar (Güven Artırıcılar)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isOrganization && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>TÜRSAB Belge Numarası</Label>
                                        <Input 
                                            placeholder="Örn: 12345" 
                                            value={formData.tursabNumber}
                                            onChange={(e) => setFormData({...formData, tursabNumber: e.target.value})}
                                        />
                                        <p className="text-xs text-muted-foreground">TÜRSAB numarası onaylı işletmeler platformda Trust Score avantajı kazanır.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kuruluş Yılı</Label>
                                        <Input 
                                            type="number"
                                            placeholder="Örn: 2010" 
                                            value={formData.establishmentYear}
                                            onChange={(e) => setFormData({...formData, establishmentYear: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            {isGuide && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tecrübe Yılı</Label>
                                        <Input 
                                            type="number"
                                            placeholder="Örn: 8" 
                                            value={formData.experienceYears}
                                            onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Konuşulan Diller (Virgülle Ayırın)</Label>
                                        <Input 
                                            placeholder="Türkçe, Arapça, İngilizce" 
                                            value={formData.languagesSpoken}
                                            onChange={(e) => setFormData({...formData, languagesSpoken: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Uzmanlık Alanları (Virgülle Ayırın)</Label>
                                        <Input 
                                            placeholder="Mekke Tarihi, Hac İrşad, Engelli Birey Refakati" 
                                            value={formData.specialties}
                                            onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Video Tanıtım Linki (Youtube - Opsiyonel)</Label>
                                        <Input 
                                            placeholder="https://youtube.com/watch?v=..." 
                                            value={formData.videoIntroduction}
                                            onChange={(e) => setFormData({...formData, videoIntroduction: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end gap-4 mt-8 pb-10">
                    <Button variant="outline" onClick={() => window.history.back()}>İptal</Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saving ? 'Kaydediliyor...' : 'Vitrin Bilgilerini Kaydet'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
