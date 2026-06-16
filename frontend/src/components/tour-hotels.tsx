export function TourHotels({ hotels }: { hotels?: any }) {
    if (!hotels || (Array.isArray(hotels) && hotels.length === 0)) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Oteller</h2>
                <div className="text-muted-foreground">Otel bilgileri henüz girilmedi.</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Oteller</h2>
            <div className="grid gap-4">
                {/* TODO: Gerçek veri modeli gelince burası güncellenecek */}
                <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-auto text-slate-700 border">
                    {JSON.stringify(hotels, null, 2)}
                </pre>
            </div>
        </div>
    );
}
