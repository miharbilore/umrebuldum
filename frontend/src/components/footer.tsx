import Link from "next/link";
import { Phone, Mail, Rocket, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-[#0F172A] text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="md" showText />
          </Link>

          {/* Quick Nav & Useful Links - THE SINGLE LINE */}
          <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[13px] font-semibold uppercase tracking-wider">
            <Link href="/tours" className="hover:text-white transition-colors">Turlar</Link>
            <Link href="/umre-rehberi" className="text-amber-400 hover:text-amber-300 transition-colors">Umre Rehberi</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Paketler</Link>
            <Link href="/dashboard/posters" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Rocket className="w-3 h-3 text-amber-500" /> Afiş Motoru
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">İletişim</Link>
            <Link href="/faq" className="hover:text-white transition-colors">SSS</Link>
            <Link href="/about" className="hover:text-white transition-colors">Hakkımızda</Link>
          </nav>

          {/* Contact Actions */}
          <div className="flex items-center gap-4">
            <a href="tel:+908501234567" className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors" title="Bizi Arayın">
              <Phone className="w-4 h-4" />
            </a>
            <a href="mailto:info@umrebuldum.com" className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors" title="E-posta Gönderin">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Legal Row - Secondary Links */}
        <div className="pt-10 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Kullanım Koşulları</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Gizlilik</Link>
            <Link href="/kvkk" className="hover:text-slate-300 transition-colors">KVKK</Link>
            <Link href="/cookies" className="hover:text-slate-300 transition-colors">Çerezler</Link>
            <Link href="/listing-terms" className="hover:text-slate-300 transition-colors">İlan Şartları</Link>
            <Link href="/refund-policy" className="hover:text-slate-300 transition-colors">İade Politikası</Link>
          </div>
          
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4" />
            <span>© {currentYear} Umrebuldum. All Rights Reserved.</span>
          </div>
        </div>

        {/* Minimalist Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-[10px] leading-relaxed text-slate-600 max-w-2xl mx-auto italic">
            Yasal Uyarı: Umrebuldum, sadece seyahat acentelerinin ilanlarını yayınlayan bir platformdur. Kullanıcılardan hiçbir ücret talep etmemekteyiz. Acentelerin sunduğu hizmetlerden sorumlu tutulamaz.
          </p>
        </div>

      </div>
    </footer>
  );
}
