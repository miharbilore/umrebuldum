import { useState, useEffect } from "react";

export function useCategories() {
    const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/listing-categories");
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && Array.isArray(data?.data)) {
                        setCategories(data.data);
                    }
                }
            } catch (err) {
                console.error("Kategoriler alınamadı:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    return { categories, loading };
}
