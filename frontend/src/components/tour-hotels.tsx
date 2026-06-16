import { Building } from "lucide-react";

interface TourHotelsProps {
    hotels?: Array<{ name: string }>;
}

export function TourHotels({ hotels }: TourHotelsProps) {
    if (!hotels || hotels.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Oteller</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                {hotels.map((hotel, index) => (
                    <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="font-semibold">{hotel.name}</div>
                            <div className="text-sm text-muted-foreground">Tur Kapsamında</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
