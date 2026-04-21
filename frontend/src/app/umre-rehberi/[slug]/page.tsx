import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SmartAvatar } from '@/components/ui/smart-avatar';
import { Calendar, ChevronLeft, Eye, Play, BookOpenCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ArticleActions } from '@/components/rehber/ArticleActions';
import { WriterCTA } from '@/components/rehber/WriterCTA';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const article = await prisma.guideArticle.findUnique({
    where: { slug },
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
  const { slug } = await params;

  const article = await prisma.guideArticle.findUnique({
    where: { slug },
    include: { author: true }
  });

  if (!article) notFound();

  // Fetch related articles from the same category (exclude current)
  const relatedArticles = await prisma.guideArticle.findMany({
    where: {
      isPublished: true,
      category: article.category,
      id: { not: article.id },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      category: true,
    },
  });

  // Increment view count (fire-and-forget)
  prisma.guideArticle.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {});

  return (
    <article className="min-h-screen bg-white pb-32">
      {/* ─── Editorial Header Section ─── */}
      <header className="container mx-auto px-4 pt-16 md:pt-24 max-w-4xl">
          <Link 
              href="/umre-rehberi" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-8 group transition-all"
          >
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">Rehber Merkezi</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                  {article.category}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(article.createdAt), 'd MMMM yyyy', { locale: tr })}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Eye className="w-4 h-4" />
                  {article.viewCount + 1} Görüntüleme
              </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-10 text-balance">
              {article.title}
          </h1>

          <div className="flex items-center justify-between gap-6 pb-12 border-b border-slate-100">
              <div className="flex items-center gap-4">
                  <SmartAvatar 
                      src={article.author?.image || ""} 
                      name={article.author?.name || "Umrebuldum Editör"} 
                      className="w-14 h-14 border-2 border-white shadow-md"
                  />
                  <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">YAZAR</p>
                      <p className="text-base font-black text-slate-900 leading-none">{article.author?.name || "Umrebuldum Editör"}</p>
                  </div>
              </div>
              <ArticleActions />
          </div>
      </header>

      {/* ─── Visual & Content Section ─── */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto lg:max-w-none grid lg:grid-cols-12 gap-16">
            
            <div className="lg:col-span-8">
                {/* ─── Premium Featured Image ─── */}
                <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-slate-100">
                    <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* ─── YouTube Video Player ─── */}
                {article.youtubeVideoId && (
                  <div className="mb-16">
                    <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl bg-black aspect-video group">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${article.youtubeVideoId}?rel=0&modestbranding=1`}
                        title={`${article.title} - Video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <Play className="w-3.5 h-3.5 text-primary" />
                      Video Rehber
                    </div>
                  </div>
                )}

                {/* ─── Article Prose ─── */}
                <div className="prose prose-slate prose-xl lg:prose-2xl max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:font-medium
                    prose-strong:font-black prose-strong:text-slate-900
                    prose-li:text-slate-700 prose-li:font-medium
                    prose-img:rounded-[2rem] prose-img:shadow-2xl
                    selection:bg-primary/30"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* ─── Post Footer ─── */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArticleActions />
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Son Güncelleme: {format(new Date(article.updatedAt), 'd MMM yyyy', { locale: tr })}
                    </div>
                </div>

                {/* ─── Premium Writer CTA ─── */}
                <WriterCTA />
            </div>

            {/* ─── Sidebar ─── */}
            <aside className="lg:col-span-4 space-y-12">
                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 md:p-10 sticky top-32 border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                        İlginizi Çekebilir
                    </h3>
                    <div className="space-y-8">
                        {relatedArticles.length > 0 ? (
                          relatedArticles.map((related) => (
                            <Link key={related.id} href={`/umre-rehberi/${related.slug}`} className="group flex gap-4">
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md border border-white">
                                    <Image src={related.coverImage} alt={related.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">REHBER</p>
                                    <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                        {related.title}
                                    </h4>
                                </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                              <BookOpenCheck className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                              Bu kategoride henüz başka makale bulunmuyor. Yakında eklenecek!
                            </p>
                          </div>
                        )}
                    </div>
                    
                    <Button asChild variant="outline" className="w-full mt-10 h-14 rounded-2xl border-slate-200 font-black uppercase text-xs tracking-widest hover:bg-white hover:shadow-xl hover:border-white transition-all duration-300">
                        <Link href="/umre-rehberi">Tüm Rehberleri Gör</Link>
                    </Button>
                </div>
            </aside>
        </div>
      </div>
    </article>
  );
}
