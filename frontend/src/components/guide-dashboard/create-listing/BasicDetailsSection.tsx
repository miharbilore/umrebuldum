import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BasicDetailsSectionProps {
    title: string;
    setTitle: (val: string) => void;
    category?: string;
    handleCategoryChange: (val: string) => void;
    categories: Array<{ slug: string; name: string }>;
}

export function BasicDetailsSection({
    title,
    setTitle,
    category,
    handleCategoryChange,
    categories
}: BasicDetailsSectionProps) {
    return (
        <>
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
                <Select value={category} onValueChange={handleCategoryChange}>
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
        </>
    );
}
