import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LocationAndPriceSectionProps {
    departureCity: string;
    setDepartureCity: (val: string) => void;
    departureCities: Array<{ id: string; name: string; airport: string }>;
    city: string;
    setCity: (val: string) => void;
    meetingCity: string;
    setMeetingCity: (val: string) => void;
    price: string;
    setPrice: (val: string) => void;
    hotelName: string;
    setHotelName: (val: string) => void;
    airline: string;
    setAirline: (val: string) => void;
    quota: string;
    setQuota: (val: string) => void;
    extraServices: string[];
    toggleService: (val: string) => void;
}

export function LocationAndPriceSection({
    departureCity, setDepartureCity, departureCities,
    city, setCity,
    meetingCity, setMeetingCity,
    price, setPrice,
    hotelName, setHotelName,
    airline, setAirline,
    quota, setQuota,
    extraServices, toggleService
}: LocationAndPriceSectionProps) {
    const servicesList = ["Otel Dahil", "Transfer", "Rehberlik", "7/24 Destek", "Bayan Rehber"];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Kalkış Şehri</label>
                    <Select value={departureCity} onValueChange={setDepartureCity} required>
                        <SelectTrigger className="min-h-11">
                            <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            {departureCities.length === 0 ? (
                                <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                            ) : (
                                departureCities.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
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
        </>
    );
}
