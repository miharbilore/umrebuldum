import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function WriterCTA() {
  return (
    <div className="mt-24 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden group">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-hover:bg-primary/20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/30">
            <Sparkles className="w-3.5 h-3.5" />
            Yazarlık Ayrıcalığı
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
            Tecrübelerinizi On binlerce <br /> <span className="text-primary">Umre Yolcusuyla Paylaşın</span>
          </h3>
          <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
            Kutsal topraklardaki tecrübelerinizi binlerce Umre yolcusuyla paylaşmak ister misiniz? 
            Platformumuzda makale yayınlama ayrıcalığı, kalite standartlarımız gereği yalnızca 
            <strong className="text-white ml-1">Onaylı Rehber ve Acentelerimize</strong> özeldir.
          </p>
        </div>
        
        <div className="shrink-0">
          <Button asChild className="h-14 px-8 rounded-2xl bg-primary text-slate-900 hover:bg-white hover:scale-105 transition-all duration-300 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
            <Link href="/pricing" className="flex items-center gap-2">
              Onaylı Rehber / Acente Ol
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
