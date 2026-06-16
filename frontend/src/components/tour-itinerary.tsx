import { MapPin } from "lucide-react";

interface TourDay {
    day: number;
    city: string;
    title: string;
    description: string;
}

interface TourItineraryProps {
    itinerary?: TourDay[];
}

export function TourItinerary({ itinerary }: TourItineraryProps) {
    if (!itinerary || itinerary.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tur Programı</h2>
            <div className="relative border-l-2 border-primary/20 ml-3 md:ml-4 space-y-8 pb-4">
                {itinerary.map((item, index) => (
                    <div key={index} className="relative pl-8 md:pl-10">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[11px] top-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] ring-4 ring-white">
                            {item.day}
                        </div>
                        
                        <div className="bg-slate-50 border rounded-xl p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                                {item.city && (
                                    <div className="flex items-center gap-1 text-sm text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap w-fit">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="font-medium">{item.city}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
