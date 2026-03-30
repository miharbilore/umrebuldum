import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Map, MapPin, Compass, Lightbulb, ChevronRight, BookOpen, Star, Sparkles, Navigation, Globe2, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Umre Rehberi Hub',
  description: 'Umre yolculuğunuzda size rehberlik edecek tüm içeriklere tek bir noktadan ulaşın.',
};

const guideOptions = [
  {
    id: 'harita',
    title: 'Haritalı Gezi Rehberi',
    description: 'Mekke ve Medinedeki tüm kutsal mekanları interaktif bir harita üzerinde adım adım keşfedin. GPS uyumlu sanal tur ile yolunuzu bulun.',
    image: '/images/tour/mekke/mescid-i-haram.jpg',
    href: '/umre-rehber.html',
    icon: Globe2,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    tags: ['İnteraktif', 'Konum Bazlı', 'Yeni'],
  },
  {
    id: 'sanal-tur',
    title: 'Sanal Tur ve Siyer',
    description: 'Kutsal mekanların tarihsel arka planını, Siyer-i Nebi ve Nüzul sebeplerini derinlemesine okuyabileceğiniz görsel şölen.',
    image: '/images/tour/medine/mescid-i-nebevi.jpg',
    href: '/sanal-tur',
    icon: BookMarked,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    tags: ['Detaylı Okuma', 'Tarihi Arka Plan'],
  },
  {
    id: 'yasam',
    title: 'Yaşam Rehberi',
    description: 'Kutsal topraklarda hayat kurtaran pratik bilgiler; alışveriş, yeme-içme, sağlık tavsiyeleri ve dijital uygulamalar rehberi.',
    image: '/images/rehber/alisveris.jpg',
    href: '/yasam-rehberi',
    icon: Sparkles,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    tags: ['Pratik Bilgiler', 'İpuçları'],
  }
];

export default function RehberHubPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/rehber/hero.jpg"
          alt="Umre Rehberi Hub"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Compass className="w-4 h-4" />
              <span className="text-sm font-medium">Size Özel Rehberlik</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold mb-4 text-balance">
              Umre Rehberine<br className="md:hidden" /> Hoş Geldiniz
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto text-pretty">
              Kutsal topraklardaki tüm ihtiyaçlarınız için ihtiyacınız olan rehber tipini seçerek manevi yolculuğunuza başlayın.
            </p>
          </div>
        </div>
      </section>

      {/* Guide Options */}
      <section className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {guideOptions.map((guide, index) => (
            <div
              key={guide.id}
              className="group flex flex-col bg-card rounded-2xl overflow-hidden border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Card Image Header */}
              <div className="relative h-60 overflow-hidden">
                <Image
                  src={guide.image}
                  alt={guide.title}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${guide.color} opacity-60 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Icon & Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                      <guide.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {guide.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-6 md:p-8">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {guide.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${guide.bgColor} ${guide.textColor}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <p className="text-muted-foreground flex-1 mb-8 leading-relaxed">
                  {guide.description}
                </p>
                
                <Link href={guide.href} className="mt-auto">
                  <Button 
                    className={`w-full h-12 text-md font-semibold bg-gradient-to-r ${guide.color} hover:opacity-90 transition-opacity`}
                  >
                    Hemen Başla
                    <Navigation className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Bottom Info Section */}
      <section className="container mx-auto px-4 mt-24">
         <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-indigo-100 flex flex-col md:flex-row items-center gap-8">
           <div className="p-4 bg-white rounded-2xl shadow-sm hidden md:block">
              <Lightbulb className="w-12 h-12 text-indigo-500" />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-3">Hangi rehber bana uygun?</h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
                 Kutsal topraklara hiç gitmediyseniz önce <strong className="text-foreground">Sanal Tur</strong> ile mekanları tanıyabilir, seyahat hazırlığında iseniz <strong className="text-foreground">Yaşam Rehberini</strong> okuyabilir, oradayken de anlık yön bulmak için <strong className="text-foreground">Haritalı Gezi Rehberini</strong> kullanabilirsiniz.
              </p>
           </div>
         </div>
      </section>
    </main>
  );
}
