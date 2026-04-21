"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Filter, X, ChevronDown, Check, Coins, Calendar, Clock, Crown, Wallet, Building2, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cities } from "@/lib/data/cities";
import { cn } from "@/lib/utils";

interface ToursFilterProps {
  currentCity?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentDate?: string;
  currentCategory?: string;
  currentDays?: string; // Comma separated selected ranges
  currentSort?: string;
}

const CATEGORIES = [
  { id: "all", title: "Tüm Kategoriler", icon: Filter },
  { id: "VIP", title: "VIP Turlar", icon: Crown },
  { id: "EKONOMIK", title: "Ekonomik Turlar", icon: Wallet },
  { id: "DIYANET", title: "Diyanet Turları", icon: Building2 },
  { id: "OZEL", title: "Özel Gruplar", icon: Sparkles },
];

const DURATIONS = [
  { id: "7-10", label: "7 - 10 Gün" },
  { id: "14", label: "14 Gün" },
  { id: "20+", label: "20+ Gün" },
];

export function ToursFilter({
  currentCity,
  currentMinPrice,
  currentMaxPrice,
  currentDate,
  currentCategory,
  currentDays,
  currentSort,
}: ToursFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Filter States
  const [departureCity, setDepartureCity] = useState(currentCity || "all");
  const [date, setDate] = useState<Date | undefined>(
    currentDate ? new Date(currentDate) : undefined
  );
  const [minPrice, setMinPrice] = useState(currentMinPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || "");
  const [category, setCategory] = useState(currentCategory || "all");
  const [selectedDays, setSelectedDays] = useState<string[]>(currentDays ? currentDays.split(",") : []);
  const [sort, setSort] = useState(currentSort || "recommended");

  // Sync with searchParams if they change externally (e.g., via SearchSummaryBar)
  useEffect(() => {
    setCategory(currentCategory || "all");
    setDepartureCity(currentCity || "all");
    if (currentDate) {
      setDate(new Date(currentDate));
    } else {
      setDate(undefined);
    }
  }, [currentCategory, currentCity, currentDate]);

  const updateURL = useCallback((newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page"); // Reset pagination
    router.push(`/tours?${params.toString()}`);
  }, [router, searchParams]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    updateURL({ category: val === "all" ? null : val });
  };

  const handleCityChange = (val: string) => {
    setDepartureCity(val);
    updateURL({ departureCity: val === "all" ? null : val });
  };

  const handleSortChange = (val: string) => {
    setSort(val);
    updateURL({ sort: val });
  };

  const handlePriceBlur = () => {
    updateURL({ 
        minPrice: minPrice || null, 
        maxPrice: maxPrice || null 
    });
  };

  const handleDurationChange = (id: string, checked: boolean) => {
    let newDays: string[];
    if (checked) {
      newDays = [...selectedDays, id];
    } else {
      newDays = selectedDays.filter(d => d !== id);
    }
    setSelectedDays(newDays);
    updateURL({ days: newDays.length > 0 ? newDays.join(",") : null });
  };

  const clearFilters = () => {
    setDepartureCity("all");
    setDate(undefined);
    setMinPrice("");
    setMaxPrice("");
    setCategory("all");
    setSelectedDays([]);
    setSort("recommended");
    router.push("/tours");
    setIsOpen(false);
  };

  const hasActiveFilters = currentCity || currentDate || currentMinPrice || currentMaxPrice || (currentCategory && currentCategory !== 'all') || currentDays;

  const FilterContent = () => (
    <div className="flex flex-col gap-10">
      {/* 0. City Filter */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Kalkış Şehri
        </Label>
        <Select value={departureCity} onValueChange={handleCityChange}>
          <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-100 text-slate-900 font-bold shadow-sm">
            <SelectValue placeholder="Tüm Şehirler" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-xl max-h-[300px]">
            <SelectItem value="all">Tüm Şehirler</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 1. Sorting */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-primary" /> Sıralama
        </Label>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-100 text-slate-900 font-bold shadow-sm">
            <SelectValue placeholder="Sıralama Seçin" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
            <SelectItem value="recommended">Önerilen</SelectItem>
            <SelectItem value="price_asc">Fiyat: Düşükten Yükseğe</SelectItem>
            <SelectItem value="price_desc">Fiyat: Yüksekten Düşüğe</SelectItem>
            <SelectItem value="date_asc">Tarih: En Yakın</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 2. Categories (Radio List) */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" /> Kategoriler
        </Label>
        <RadioGroup value={category} onValueChange={handleCategoryChange} className="grid grid-cols-1 gap-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="relative">
              <RadioGroupItem value={cat.id} id={`cat-${cat.id}`} className="peer sr-only" />
              <Label
                htmlFor={`cat-${cat.id}`}
                className={cn(
                  "flex items-center gap-3 px-4 min-h-[52px] rounded-2xl border transition-all cursor-pointer font-bold select-none",
                  category === cat.id 
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                    : "bg-white border-slate-100 text-slate-600 hover:border-primary/30"
                )}
              >
                <cat.icon className={cn("w-5 h-5", category === cat.id ? "text-primary" : "text-slate-400")} />
                {cat.title}
                {category === cat.id && <Check className="w-4 h-4 ml-auto text-primary" />}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 3. Price Range (Inputs) */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" /> Fiyat Aralığı (₺)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceBlur}
              className="h-14 rounded-2xl bg-white border-slate-100 font-bold pl-4"
            />
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceBlur}
              className="h-14 rounded-2xl bg-white border-slate-100 font-bold pl-4"
            />
          </div>
        </div>
      </div>

      {/* 4. Duration (Checkboxes) */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Tur Süresi
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {DURATIONS.map((dur) => (
            <div key={dur.id} className="flex items-center justify-between min-h-[48px] px-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 transition-all">
              <Label htmlFor={`dur-${dur.id}`} className="flex-1 font-bold text-slate-700 cursor-pointer">{dur.label}</Label>
              <Checkbox 
                id={`dur-${dur.id}`}
                checked={selectedDays.includes(dur.id)}
                onCheckedChange={(checked) => handleDurationChange(dur.id, !!checked)}
                className="w-6 h-6 rounded-lg data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters (Desktop) */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          onClick={clearFilters}
          className="lg:flex hidden h-12 text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold transition-all"
        >
          <X className="w-4 h-4 mr-2" />
          Filtreleri Temizle
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Sticky CTA for Filter */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -track-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button id="mobile-filter-trigger" className="w-full h-14 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              Filtrele ve Sırala
              {hasActiveFilters && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-[3rem] px-8 pt-10">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-3xl font-black text-slate-900">Filtreler</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] pr-2 pb-10">
              <FilterContent />
            </div>
            <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex flex-col gap-3">
                <Button onClick={() => setIsOpen(false)} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest">
                  Sonuçları Göster
                </Button>
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="w-full h-12 font-bold text-slate-400">
                        Sıfırla
                    </Button>
                )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar Layout */}
      <aside className="hidden lg:block">
        <div className="sticky top-32 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
           <FilterContent />
        </div>
      </aside>
    </>
  );
}
