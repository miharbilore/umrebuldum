import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateListing() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Form fields
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

    // Image fields
    const [selectedPredefinedImage, setSelectedPredefinedImage] = useState<string | undefined>(undefined);
    const [customImageFile, setCustomImageFile] = useState<File | null>(null);
    const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);

    const toggleService = (service: string) => {
        setExtraServices(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const handleCategoryChange = (val: string) => {
        setCategory(val);
        setSelectedPredefinedImage(undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!title || !city || !price) {
            toast.error("Lütfen zorunlu alanları doldurun (Başlık, Şehir, Fiyat).");
            setLoading(false);
            return;
        }

        try {
            let finalImageUrl = selectedPredefinedImage;

            if (customImageFile) {
                const formData = new FormData();
                formData.append("file", customImageFile);
                
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) throw new Error("Görsel yüklemesi başarısız oldu.");
                
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
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "İlan oluşturulamadı.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
        state: {
            title, setTitle,
            category, handleCategoryChange,
            city, setCity,
            departureCity, setDepartureCity,
            meetingCity, setMeetingCity,
            hotelName, setHotelName,
            airline, setAirline,
            price, setPrice,
            quota, setQuota,
            extraServices, toggleService,
            selectedPredefinedImage, setSelectedPredefinedImage,
            customImageFile, setCustomImageFile,
            customImagePreview, setCustomImagePreview,
            loading
        },
        handleSubmit
    };
}
