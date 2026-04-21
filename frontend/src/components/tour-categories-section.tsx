import Link from "next/link";
import Image from "next/image";
import { Crown, Wallet, Building2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    id: "vip",
    title: "VIP Turlar",
    description: "En lüks oteller ve özel hizmetlerle üst düzey umre deneyimi.",
    icon: Crown,
    href: "/tours?category=VIP",
    image: "/images/tour/kaaba.jpg",
    accent: "text-amber-500",
    bg: "bg-amber-50/50",
  },
  {
    id: "ekonomik",
    title: "Ekonomik Turlar",
    description: "Bütçe dostu, güvenilir ve konforlu umre seçenekleri.",
    icon: Wallet,
    href: "/tours?category=EKONOMIK",
    image: "/images/tour/masjid-nabawi.jpg",
    accent: "text-emerald-600",
    bg: "bg-emerald-50/50",
  },
  {
    id: "diyanet",
    title: "Diyanet Turları",
    description: "Diyanet İşleri Başkanlığı koordinasyonunda düzenlenen turlar.",
    icon: Building2,
    href: "/tours?category=DIYANET",
    image: "/images/tour/quba.jpg",
    accent: "text-blue-600",
    bg: "bg-blue-50/50",
  },
  {
    id: "ozel",
    title: "Özel Gruplar",
    description: "Aile veya arkadaş gruplarına özel butik planlamalar.",
    icon: Sparkles,
    href: "/tours?category=OZEL",
    image: "/images/tour/rawdah.jpg",
    accent: "text-[#FFB800]",
    bg: "bg-orange-50/50",
  },
];

export function TourCategoriesSection() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header - Centered Motto Style */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Her İhtiyaca Uygun <span className="text-primary underline decoration-primary/20 underline-offset-8">Tur Kategorileri</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto italic">
            "Manevi yolculuğunuzda bütçenize ve beklentilerinize en uygun kategoriyi seçerek <span className="text-[#059669]">size özel ilanlarımızı</span> hemen inceleyin."
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative h-[500px] flex flex-col overflow-hidden rounded-[3rem] bg-slate-50 border border-slate-100 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-3"
            >
              {/* Image Content */}
              <div className="relative h-3/5 w-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
              </div>

              {/* Text Content */}
              <div className="relative flex-1 p-8 flex flex-col justify-between">
                <div>
                  <div className={cn("inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-6 transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-110 shadow-sm", cat.bg)}>
                    <cat.icon className={cn("w-6 h-6", cat.accent)} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#059669] group-hover:gap-5 transition-all duration-500">
                  Kategoriyi Keşfet
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
