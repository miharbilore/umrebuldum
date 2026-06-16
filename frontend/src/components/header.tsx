"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Phone, User, LogOut, LayoutDashboard, Settings, Map, Compass, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { CONTACT_PHONE_NUMBER, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import { usePathname } from "next/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Mobil menü açıkken arka plan scroll kilidini aktif et ──────────
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup: bileşen unmount olursa scroll'u geri aç
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Logo size="md" showText />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="/tours"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Umre Turları
          </Link>
          
          <Link
            href="/umre-rehberi"
            className="text-sm font-bold text-foreground/80 transition-all hover:text-primary flex items-center gap-2 group"
          >
            <Compass className="h-4 w-4 text-primary group-hover:rotate-45 transition-transform" />
            Umre Rehberi
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Hakkımızda
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Fiyatlandırma
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            İletişim
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href={`tel:${CONTACT_PHONE_NUMBER}`}
            className="hidden xl:flex items-center gap-2 text-sm font-medium text-foreground/80 mr-4 transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4" />
            {CONTACT_PHONE_DISPLAY}
          </a>

          {/* Teklif Al - Only for USERS or Guests */}
          {mounted && (!session || session.user.role === 'USER') && (
            <Button asChild variant="outline" className="hidden lg:flex mr-2">
              <Link href="/request">Teklif Al</Link>
            </Button>
          )}

          {mounted ? (
            <>
              {session?.user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild className="text-sm font-medium">
                    <Link href="/login">Giriş Yap</Link>
                  </Button>
                  <Button asChild className="text-sm font-semibold">
                    <Link href="/login">Kayıt Ol</Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
             <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-muted rounded-md animate-pulse"></div>
                <div className="h-9 w-20 bg-muted rounded-md animate-pulse"></div>
             </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border bg-card lg:hidden overflow-y-auto max-h-[calc(100vh-80px)]">
          <nav className="flex flex-col gap-2 p-4">
            {session?.user && (
              <div className="mb-4 flex items-center gap-3 px-5 py-2 bg-muted/50 rounded-xl">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback>{getInitials(session.user.name || session.user.email)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{session.user.name || "Kullanıcı"}</span>
                  <span className="text-xs text-muted-foreground">{session.user.email}</span>
                </div>
              </div>
            )}

            <Link
              href="/tours"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              🕋 Umre Turları
            </Link>
            
            <Link
              href="/umre-rehberi"
              className="rounded-xl px-5 py-3 text-lg font-bold text-primary bg-primary/5 border border-primary/10 flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              📍 Umre Rehberi
            </Link>

            <Link
              href="/about"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              ℹ️ Hakkımızda
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              💳 Fiyatlandırma
            </Link>
            <Link
              href="/contact"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              📞 İletişim
            </Link>

            {session?.user ? (
              <>
                <div className="h-px bg-border my-2" />
                <Link
                  href="/dashboard"
                  className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Panelim
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="rounded-xl px-5 py-3 text-lg font-medium text-red-500 transition-colors hover:bg-secondary flex items-center gap-3 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4 px-2">
                <Button variant="outline" size="lg" asChild className="h-12">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>Giriş Yap</Link>
                </Button>
                <Button size="lg" asChild className="h-12">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>Kayıt Ol</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
