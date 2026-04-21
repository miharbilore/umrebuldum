"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Calendar, Search, X, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { cities } from "@/lib/data/cities";
import { cn } from "@/lib/utils";

interface SearchSummaryBarProps {
  city?: string;
  date?: string;
}

export function SearchSummaryBar({ city, date }: SearchSummaryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states for the modal
  const [newCity, setNewCity] = useState(city || "");
  const [newDate, setNewDate] = useState<Date | undefined>(
    date ? new Date(date) : undefined
  );

  const handleSearchUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCity && newCity !== "all") {
      params.set("departureCity", newCity);
    } else {
      params.delete("departureCity");
    }

    if (newDate) {
      const offsetDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000));
      params.set("date", offsetDate.toISOString().split('T')[0]);
    } else {
      params.delete("date");
    }

    router.push(`/tours?${params.toString()}`);
    setIsModalOpen(false);
  };

  const formattedDate = date 
    ? new Date(date).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
    : "Tüm Tarihler";

  const displayCity = city && city !== "all" ? city : "Tüm Şehirler";

  return (
    <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Summary Info */}
          <div className="flex flex-1 items-center gap-2 md:gap-6 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm md:text-lg whitespace-nowrap">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{displayCity} Kalkışlı</span>
              </div>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="flex items-center gap-2 text-slate-500 font-medium text-[12px] md:text-base whitespace-nowrap">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-bold px-4 md:px-6 h-10 md:h-11 shadow-sm transition-all"
                >
                  <Search className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Aramayı Düzenle</span>
                  <span className="sm:hidden text-xs">Düzenle</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Turları Yeniden Filtrele</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearchUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Kalkış Şehri</label>
                    <Select value={newCity} onValueChange={setNewCity}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-lg">
                        <SelectValue placeholder="Şehir Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Şehirler</SelectItem>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Tercih Edilen Tarih</label>
                    <DatePicker 
                      date={newDate} 
                      setDate={setNewDate}
                      className="w-full h-14 rounded-2xl bg-slate-50 border-slate-100 text-lg"
                      placeholder="Tarih seçin (Opsiyonel)"
                    />
                  </div>

                  <Button type="submit" className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary hover:text-white text-white font-black uppercase tracking-widest transition-all mt-4">
                    Sonuçları Güncelle
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* Mobile Filter Anchor - Just a hint since the drawer is handled in ToursFilter */}
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => document.getElementById('mobile-filter-trigger')?.click()}
              className="lg:hidden rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4 shadow-md"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
