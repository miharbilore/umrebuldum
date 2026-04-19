import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SmartAvatar } from '@/components/ui/smart-avatar';
import { Calendar, Clock, ChevronLeft, Share2, Bookmark, Eye } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.guideArticle.findUnique({
    where: { slug: params.slug },
  });

  if (!article) return { title: 'Makale Bulunamadı' };

  return {
    title: `${article.title} | Umrebuldum Rehber`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = params;

  // HOTFIX: Bypassing stale Prisma Client types for GuideArticle
  const articles: any[] = await prisma.$queryRaw`
    SELECT * FROM guide_articles 
    WHERE slug = ${slug} 
    LIMIT 1
  `;
  const article = articles[0] || null;

  if (!article) notFound();

  // Increment view count via raw query
  prisma.$executeRaw`
    UPDATE guide_articles 
    SET viewCount = viewCount + 1 
    WHERE id = ${article.id}
  `.catch(() => {});

  return (
    <article className="min-h-screen bg-white">
      {/* Article Header / Hero */}
      <header className="relative h-[70vh] min-h-[500px] flex items-end pb-20 overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-white" />
        
        <div className="container mx-auto px-4 relative z-10">
            <Link 
                href="/umre-rehberi" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 group transition-all"
            >
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl group-hover:bg-white/20">
                    <ChevronLeft className="w-5 h-5" />
                </div>
                <span className="font-black text-xs uppercase tracking-widest">Rehber Merkezi</span>
            </Link>
            
            <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 bg-[#FFB800] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        {article.category}
                    </span>
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(article.createdAt), 'd MMMM yyyy', { locale: tr })}
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold">
                        <Eye className="w-4 h-4" />
                        {article.viewCount + 1} Görüntüleme
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8 text-balance">
                    {article.title}
                </h1>
                
                {/* Author Card (Fixed in header for premium look) */}
                <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-lg border border-white/50 rounded-[2rem] w-fit">
                    <SmartAvatar 
                        src={article.author?.image || ""} 
                        name={article.author?.name || "Umrebuldum Editör"} 
                        className="w-12 h-12 border-2 border-white shadow-sm"
                    />
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">YAZAR</p>
                        <p className="text-sm font-black text-slate-900 leading-none">{article.author?.name || "Umrebuldum Editör"}</p>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-12 gap-16">
            {/* Left Column: Post Info & Content */}
            <div className="lg:col-span-8">
                <div className="prose prose-slate prose-xl max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                    prose-strong:font-black prose-strong:text-slate-900
                    prose-li:text-slate-600 prose-li:font-medium
                    prose-img:rounded-[2rem] prose-img:shadow-2xl
                    selection:bg-[#FFB800]/30"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-slate-50">
                            <Share2 className="w-5 h-5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-slate-50">
                            <Bookmark className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Son Güncelleme: {format(new Date(article.updatedAt), 'd MMM yyyy', { locale: tr })}
                    </div>
                </div>
            </div>

            {/* Right Column: Sidebar */}
            <aside className="lg:col-span-4 space-y-12">
                {/* Search / Newsletter or Related Articles */}
                <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 sticky top-32">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-[#FFB800] rounded-full" />
                        İlginizi Çekebilir
                    </h3>
                    <div className="space-y-8">
                        {/* Placeholder for related articles (could be another DB query) */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group flex gap-4 cursor-pointer">
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                    <Image src={`https://images.unsplash.com/photo-1591414442261-${i}490dfbf8d2a?q=80&w=200`} alt="Benzer" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">REHBER</p>
                                    <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                        Mekke'de Alışveriş Yaparken Dikkat Edilmesi Gereken 5 Kural
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <Button asChild variant="outline" className="w-full mt-10 h-14 rounded-2xl border-slate-200 font-black uppercase text-xs tracking-widest hover:bg-white hover:shadow-lg transition-all">
                        <Link href="/umre-rehberi">Tüm Rehberleri Gör</Link>
                    </Button>
                </div>
            </aside>
        </div>
      </div>
    </article>
  );
}
