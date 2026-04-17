"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { categoryImages } from "@/lib/categoryImages";

export function CreateListingForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [departureCity, setDepartureCity] = useState("");
    const [meetingCity, setMeetingCity] = useState("");
    const [hotelName, setHotelName] = useState("");
    const [airline, setAirline] = useState("");
    const [price, setPrice] = useState("");
    const [quota, setQuota] = useState("30");
    const [extraServices, setExtraServices] = useState<string[]>([]);
    const [category, setCategory] = useState<string | undefined>(undefined);
    
    // Image selection state
    const [selectedPredefinedImage, setSelectedPredefinedImage] = useState<string | undefined>(undefined);
    const [customImageFile, setCustomImageFile] = useState<File | null>(null);
    const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/listing-categories");
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted && Array.isArray(data?.data)) {
                    setCategories(data.data);
                }
            } catch (err) {
                console.error("Kategori listesi alınamadı:", err);
            }
        };

        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    // Reset image selections when category changes
    useEffect(() => {
        setSelectedPredefinedImage(undefined);
    }, [category]);

    const servicesList = ["Otel Dahil", "Transfer", "Rehberlik", "7/24 Destek", "Bayan Rehber"];

    const toggleService = (service: string) => {
        setExtraServices(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomImageFile(file);
            setCustomImagePreview(URL.createObjectURL(file));
            setSelectedPredefinedImage(undefined); // Clear predefined if custom is chosen
        }
    };

    const clearCustomImage = () => {
        setCustomImageFile(null);
        setCustomImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = selectedPredefinedImage;

            // Upload custom image if present
            if (customImageFile) {
                const formData = new FormData();
                formData.append("file", customImageFile);
                
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) {
                    throw new Error("Görsel yüklemesi başarısız oldu.");
                }
                
                const uploadData = await uploadRes.json();
                if (uploadData.success && uploadData.url) {
                    finalImageUrl = uploadData.url;
                } else {
                    throw new Error("Görsel sunucuya kaydedilemedi.");
                }
            }

            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    category: category ?? null,
                    city,
                    departureCity,
                    meetingCity,
                    hotelName,
                    airline,
                    price,
                    quota,
                    extraServices,
                    image: finalImageUrl ?? null
                })
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.error === "ProfileIncomplete") {
                    toast.error("İlan oluşturmak için profilinizi tamamlamalısınız.");
                    router.push("/guide/profile");
                    return;
                }
                throw new Error("Failed to create");
            }

            toast.success("İlan başarıyla oluşturuldu!");
            router.push("/dashboard/listings");
        } catch (e: any) {
            toast.error(e.message || "İlan oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    const availablePredefinedImages = category ? categoryImages[category] || [] : [];

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="font-bold mb-4">Yeni Tur Oluştur</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tur Başlığı</label>
                    <Input
                        className="min-h-11"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Ramazan Umresi"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tur Kategorisi (Opsiyonel)</label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="min-h-11">
                            <SelectValue placeholder="Kategori seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.length === 0 ? (
                                <SelectItem value="loading" disabled>
                                    Kategori bulunamadı
                                </SelectItem>
                            ) : (
                                categories.map((item) => (
                                    <SelectItem key={item.slug} value={item.slug}>
                                        {item.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Görsel Yükleme ve Seçme Alanı (NO CLS, %100 Türkçe) */}
                <div className="space-y-3 p-4 bg-gray-50 border rounded-lg">
                    <label className="block text-sm font-medium">Tur Görseli (Opsiyonel)</label>
                    
                    {category && availablePredefinedImages.length > 0 && (
                        <div className="mb-4">
                            <span className="text-xs text-gray-500 mb-2 block">Kategoriye Ait Hazır Görseller:</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {availablePredefinedImages.map((imgPath, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            setSelectedPredefinedImage(imgPath);
                                            clearCustomImage();
                                        }}
                                        className={`relative aspect-video rounded cursor-pointer overflow-hidden border-2 transition-all ${selectedPredefinedImage === imgPath ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <Image 
                                            src={imgPath} 
                                            alt={`${category} hazır görsel`} 
                                            fill 
                                            className="object-cover" 
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Veya Cihazınızdan Yükleyin:</span>
                        {customImagePreview ? (
                            <div className="relative aspect-video max-w-sm rounded overflow-hidden border">
                                <Image src={customImagePreview} alt="Yüklenen görsel önizleme" fill className="object-cover" />
                                <div className="absolute top-2 right-2">
                                    <Button type="button" variant="destructive" size="sm" onClick={clearCustomImage} className="min-h-11">
                                        Temizle
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/jpeg, image/png, image/webp" 
                                    onChange={handleFileChange} 
                                    className="min-h-11 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Rehber Şehri (Konum)</label>
                        <Input
                            className="min-h-11"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Örn: Mekke / Medine"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Kalkış Şehri</label>
                        <Input
                            className="min-h-11"
                            value={departureCity}
                            onChange={(e) => setDepartureCity(e.target.value)}
                            placeholder="Örn: İstanbul"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Buluşma Noktası (Opsiyonel)</label>
                        <Input
                            className="min-h-11"
                            value={meetingCity}
                            onChange={(e) => setMeetingCity(e.target.value)}
                            placeholder="Örn: Cidde Havalimanı"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fiyat (₺)</label>
                        <Input
                            className="min-h-11"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Otel Adı (Opsiyonel)</label>
                        <Input
                            className="min-h-11"
                            value={hotelName}
                            onChange={(e) => setHotelName(e.target.value)}
                            placeholder="Örn: Swissotel"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Havayolu (Opsiyonel)</label>
                        <Input
                            className="min-h-11"
                            value={airline}
                            onChange={(e) => setAirline(e.target.value)}
                            placeholder="Örn: THY"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Ekstra Hizmetler</label>
                    <div className="flex flex-wrap gap-2">
                        {servicesList.map((service) => (
                            <button
                                key={service}
                                type="button"
                                onClick={() => toggleService(service)}
                                className={`px-4 py-2 min-h-11 rounded-full text-sm font-medium border transition-colors ${extraServices.includes(service)
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                    }`}
                            >
                                {service}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Kota</label>
                    <Input
                        className="min-h-11"
                        type="number"
                        value={quota}
                        onChange={(e) => setQuota(e.target.value)}
                        placeholder="30"
                        required
                    />
                </div>
                <Button type="submit" disabled={loading} className="w-full min-h-11 font-bold">
                    {loading ? "Oluşturuluyor..." : "İlanı Yayınla"}
                </Button>
            </form>
        </div>
    );
}
