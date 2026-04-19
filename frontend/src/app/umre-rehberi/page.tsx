import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Compass, BookOpen, Sparkles, Navigation, ArrowRight, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const revalidate = 3600; // Cache for 1 hour

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Umre Rehberi المركز | Kutsal Topraklar İçin Tek Çatı',
    description: 'Umre yolculuğunuzda size rehberlik edecek tüm içeriklere, seyahat ipuçlarına ve mekan rehberlerine tek bir noktadan ulaşın.',
  };
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  GEZI: { label: 'Gezi Rehberi', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: MapPin },
  YASAM: { label: 'Yaşam Rehberi', color: 'text-blue-700', bg: 'bg-blue-50', icon: Sparkles },
  SIYER: { label: 'Siyer & Tarih', color: 'text-amber-700', bg: 'bg-amber-50', icon: BookOpen },
};

export default async function RehberHubPage() {
  // HOTFIX: Prisma Client Windows'daki dosya kilidi (EPERM) nedeniyle güncellenemediği için 
  // geçici olarak raw query kullanıyoruz. Tablo veritabanında mevcut olduğu için bu güvenlidir.
  const articles: any[] = await prisma.$queryRaw`
    SELECT * FROM guide_articles 
    WHERE isPublished = 1 
    ORDER BY createdAt DESC
  `;

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/rehber/hero.jpg"
          alt="Umre Rehberi Hub"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-50/50" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-black text-white uppercase tracking-widest">Kapsamlı Rehber Merkezi</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none text-balance">
                Kutsal Yolculukta <br /> <span className="text-[#FFB800]">Pusulanız Olsun</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed text-pretty">
                Mekke ve Medine'deki her adımı, hazırlık aşamasından dönüşe kadar uzman rehberliğinde keşfedin.
            </p>
        </div>
      </section>

      {/* Featured Options / Categories */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sanal Tur Card (Special Case) */}
            <div className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-48">
                    <Image src="/images/tour/mekke/mescid-i-haram.jpg" alt="Sanal Tur" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 bg-[#FFB800] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">YENİ</div>
                </div>
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                            <Star className="w-5 h-5 fill-current" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Sanal Tur & Mekanlar</h3>
                    </div>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        Kutsal toprakları gitmeden önce keşfedin. 30'dan fazla mekanın hikayesi ve görseli burada.
                    </p>
                    <Button asChild className="w-full h-14 rounded-2xl bg-[#FFB800] hover:bg-[#E6A600] text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-[#FFB800]/20">
                        <Link href="/umre-rehberi/sanal-tur">Hemen Keşfet <Navigation className="w-4 h-4 ml-2" /></Link>
                    </Button>
                </div>
            </div>

            {/* Hub Articles */}
            {articles.map((article) => {
                const meta = CATEGORY_META[article.category] || CATEGORY_META.GEZI;
                const Icon = meta.icon;
                
                return (
                    <Link key={article.id} href={`/umre-rehberi/${article.slug}`} className="group">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div className="relative h-48">
                                <Image src={article.coverImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", meta.bg, meta.color)}>
                                        {meta.label}
                                    </div>
                                    <Icon className={cn("w-4 h-4", meta.color)} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight">
                                    {article.title}
                                </h3>
                                <p className="text-slate-500 font-medium mb-8 line-clamp-3 leading-relaxed">
                                    {article.excerpt}
                                </p>
                                <div className="mt-auto flex items-center text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                                    Daha Fazla Oku <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
      </section>

      {/* Info Banner */}
      <section className="container mx-auto px-4 mt-24">
         <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Aradığınızı Bulamadınız mı?</h2>
                    <p className="text-xl text-white/70 font-medium leading-relaxed max-w-2xl">
                        Rehberimiz her hafta yeni içeriklerle güncelleniyor. Özel bir konu hakkında bilgi isterseniz bize her zaman ulaşabilirsiniz.
                    </p>
                </div>
                <Button asChild className="h-16 px-10 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest">
                    <Link href="/contact">Bize Ulaşın</Link>
                </Button>
            </div>
         </div>
      </section>
    </main>
  );
}
