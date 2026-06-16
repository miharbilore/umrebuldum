import { useState, useEffect } from "react";

export function useDepartureCities() {
    const [departureCities, setDepartureCities] = useState<Array<{ id: string; name: string; airport: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchCities = async () => {
            try {
                const res = await fetch("/api/departure-cities");
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && Array.isArray(data)) {
                        setDepartureCities(data);
                    }
                }
            } catch (err) {
                console.error("Şehirler alınamadı:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCities();
        return () => {
            isMounted = false;
        };
    }, []);

    return { departureCities, loading };
}
