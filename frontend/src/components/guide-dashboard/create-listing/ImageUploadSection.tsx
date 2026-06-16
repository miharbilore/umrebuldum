import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryImages } from "@/lib/categoryImages";

interface ImageUploadSectionProps {
    category?: string;
    selectedPredefinedImage?: string;
    setSelectedPredefinedImage: (val?: string) => void;
    customImagePreview: string | null;
    setCustomImagePreview: (val: string | null) => void;
    setCustomImageFile: (file: File | null) => void;
}

export function ImageUploadSection({
    category,
    selectedPredefinedImage,
    setSelectedPredefinedImage,
    customImagePreview,
    setCustomImagePreview,
    setCustomImageFile
}: ImageUploadSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const availablePredefinedImages = category ? categoryImages[category] || [] : [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomImageFile(file);
            setCustomImagePreview(URL.createObjectURL(file));
            setSelectedPredefinedImage(undefined);
        }
    };

    const clearCustomImage = () => {
        setCustomImageFile(null);
        setCustomImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
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
                        <Image src={customImagePreview} alt="Yüklenen görsel önizleme" fill className="object-cover" sizes="300px" />
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
    );
}
