"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  Grid3X3, 
  Info, 
  MapPin, 
  Clock, 
  Lightbulb,
  Compass,
  Star,
  Mountain,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mekke Mekanlari
const mekkePlaces = [
  {
    id: "mescid-i-haram",
    title: "Mescid-i Haram ve Kabe",
    subtitle: "Yeryüzündeki İlk Mabet",
    image: "https://images.unsplash.com/photo-1591414442261-2490dfbf8d2a?q=80&w=1200",
    description: "Şüphesiz listenin en başında yer alır. Yeryüzündeki ilk mabet olan Kabe'yi içinde barındırır. Tavaf burada yapılır. Mescid-i Haram, sadece tavaf alanı değil, aynı zamanda Osmanlı revakları, Hacerü'l-Esved, Mültezem ve Hicr-i İsmail gibi detaylarıyla incelenmelidir.",
    highlights: ["Kabe - Tüm Müslümanların Kıblesi", "Hacerü'l-Esved", "Mültezem", "Hicr-i İsmail"],
    duration: "2-4 saat",
    category: "MİLLİ İBADET"
  },
  {
    id: "hira-magarasi",
    title: "Nur Dağı ve Hira Mağarası",
    subtitle: "İlk Vahyin Geldiği Yer",
    image: "https://images.unsplash.com/photo-1565552643534-114eeffb1a20?q=80&w=1200",
    description: "Hz. Muhammed'e (s.a.v.) ilk vahyin geldiği ve peygamberliğin müjdelendiği mağaranın bulunduğu dağdır. Tırmanışı biraz meşakkatli olsa da manevi değeri çok yüksektir.",
    highlights: ["İlk Vahiy (İkra) Mekanı", "Peygamberimizin Tefekkür Yeri", "Mekke Manzarası"],
    duration: "2-3 saat",
    category: "TARİHİ"
  },
  // ... Simplified for space, would normally include all
];

const medinePlaces = [
    {
      id: "mescid-i-nebevi",
      title: "Mescid-i Nebevi",
      subtitle: "Peygamber Mescidi",
      image: "https://images.unsplash.com/photo-1591604129930-f11bf88d1d86?q=80&w=1200",
      description: "Medine'nin kalbidir. Peygamberimizin inşa ettiği bu mescidin içinde Hücre-i Saadet ve cennet bahçelerinden bir bahçe olarak müjdelenen Ravza-i Mutahhara bulunur.",
      highlights: ["Yeşil Kubbe", "Ravza-i Mutahhara", "Hücre-i Saadet"],
      duration: "Sınırsız",
      category: "ANA ZİYARET"
    }
];

const categories = [
  { id: "mekke", label: "Mekke-i Mükerreme", icon: Compass, places: mekkePlaces },
  { id: "medine", label: "Medine-i Münevvere", icon: Star, places: medinePlaces },
];

export default function SanalTurPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  
  const currentPlace = activeCategory.places[currentIndex];

  const goToNext = () => {
    if (currentIndex < activeCategory.places.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
        const nextCat = categories.find(c => c.id !== activeCategory.id);
        if (nextCat) {
            setActiveCategory(nextCat);
            setCurrentIndex(0);
        }
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <main className="relative h-[calc(100vh-80px)] bg-black overflow-hidden flex flex-col">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentPlace.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1 }}
                className="relative w-full h-full"
            >
                <Image
                    src={currentPlace.image}
                    alt={currentPlace.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Header / Navigation Overlay */}
      <div className="relative z-10 p-6 md:p-10 flex items-center justify-between">
            <Link href="/umre-rehberi" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl group-hover:bg-white/20">
                    <ChevronLeft className="w-5 h-5" />
                </div>
                <span className="font-black text-xs uppercase tracking-widest hidden md:inline">Hub'a Dön</span>
            </Link>

            <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCategory(cat); setCurrentIndex(0); }}
                        className={cn(
                            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeCategory.id === cat.id ? "bg-[#FFB800] text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="md:flex items-center gap-3 hidden">
                <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all">
                    <Info className="w-5 h-5" />
                </Button>
            </div>
      </div>

      {/* Main Content Info Overlay */}
      <div className="mt-auto relative z-10 p-6 md:p-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-end gap-10">
            <div className={cn("flex-1 transition-all duration-500", showInfo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none")}>
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-[#FFB800] text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                        {currentPlace.category}
                    </span>
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        {currentPlace.duration}
                    </div>
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                    {currentPlace.title}
                </h2>
                <p className="text-lg md:text-xl text-white/70 max-w-2xl font-medium leading-relaxed mb-10 text-pretty">
                    {currentPlace.description}
                </p>
                <div className="flex flex-wrap gap-4">
                    {currentPlace.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-xs font-bold">
                            <Navigation className="w-3 h-3 text-[#FFB800]" />
                            {h}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 min-w-fit">
                <Button 
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-20"
                >
                    <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                </Button>
                <Button 
                    onClick={goToNext}
                    className="w-20 h-20 md:w-40 md:h-20 rounded-[2rem] bg-[#FFB800] hover:bg-[#E6A600] text-black shadow-2xl shadow-[#FFB800]/20 font-black uppercase tracking-widest flex items-center justify-center gap-3 group"
                >
                    <span className="hidden md:inline">İleri</span>
                    <ChevronRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
      </div>

      {/* Pagination Dot Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {activeCategory.places.map((_, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        currentIndex === i ? "w-12 bg-[#FFB800]" : "w-1.5 bg-white/20"
                    )} 
                />
            ))}
      </div>
    </main>
  );
}
