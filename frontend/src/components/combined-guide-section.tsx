import Link from "next/link";
import Image from "next/image";
import { Compass, BookOpen, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export async function CombinedGuideSection() {
    // Fetch top 2 travel guides (GEZI) and top 2 life guides (YASAM)
    const travelGuides = await prisma.$queryRaw<Prisma.GuideArticleGetPayload<{}>[]>`
        SELECT * FROM guide_articles 
        WHERE category = 'GEZI' AND isPublished = 1 
        ORDER BY createdAt DESC 
        LIMIT 2
    `;

    const lifeGuides = await prisma.$queryRaw<Prisma.GuideArticleGetPayload<{}>[]>`
        SELECT * FROM guide_articles 
        WHERE category = 'YASAM' AND isPublished = 1 
        ORDER BY createdAt DESC 
        LIMIT 2
    `;

    // Combine them into a single array for 4-column layout
    const allGuides = [...travelGuides, ...lifeGuides];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Title - Centered consistent with TourCategoriesSection */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100/50">
                        <Sparkles className="w-4 h-4" />
                        Umre Rehberi & Keşif
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Kutsal Topraklarda <span className="text-emerald-600 underline underline-offset-8 decoration-emerald-200">Rehberiniz Hazır</span>
                    </h2>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto italic">
                        "Mekke ve Medine'nin manevi atmosferini keşfedin, günlük yaşamı kolaylaştıracak <span className="text-emerald-700 font-bold">pratik ipuçlarına</span> anında ulaşın."
                    </p>
                </div>

                {/* 4-Column Grid: Dört Büyükler (The Big Four) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 mb-20">
                    {allGuides.map((guide) => (
                        <Link 
                            key={guide.id} 
                            href={`/umre-rehberi/${guide.slug}`}
                            className="group relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3"
                        >
                            {/* Background Image - Strict next/image usage */}
                            <Image 
                                src={guide.coverImage} 
                                alt={guide.title} 
                                fill 
                                className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            
                            {/* Gradient Overlay for Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                            
                            {/* Content Over the Image */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                                        {guide.category === 'GEZI' ? (
                                            <Compass className="w-4 h-4 text-emerald-300" />
                                        ) : (
                                            <BookOpen className="w-4 h-4 text-[#FFB800]" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        guide.category === 'GEZI' ? "text-emerald-300" : "text-[#FFB800]"
                                    )}>
                                        {guide.category === 'GEZI' ? "Mekan Rehberi" : "Yaşam İpucu"}
                                    </span>
                                </div>
                                <h4 className="text-2xl font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-emerald-300 transition-colors">
                                    {guide.title}
                                </h4>
                                <p className="text-sm text-white/70 font-medium line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                    {guide.excerpt}
                                </p>
                                
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                                    İçeriği Oku
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Section CTA - Centered and Mobile Friendly */}
                <div className="text-center">
                    <Button asChild size="lg" className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-emerald-700 text-white font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-900/20 active:scale-95">
                        <Link href="/umre-rehberi">Tam Rehber Merkezine Ulaşın</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
