"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Phone, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Map, BookOpen, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMenu } from "@/components/user-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 shadow-sm shrink-0">
            <span className="text-xl font-bold text-black font-serif">U</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            Umrebuldum
          </span>
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
            href="/umre-rehber.html"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary flex items-center gap-1"
          >
            Umre Gezi Rehberi
          </Link>
          
          {/* Umre Rehberi Dropdown */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus:outline-none data-[state=open]:text-primary">
                Umre Rehberi
                <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-border/50 shadow-xl bg-card">
                <div className="mb-2 px-2 py-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground/80">Kapsamlı Rehber Hub</span>
                  <Link href="/rehber" className="text-xs text-primary font-medium hover:underline">Hepsini Gör</Link>
                </div>
                <DropdownMenuSeparator className="mb-2" />
                <DropdownMenuItem asChild className="mb-1 rounded-lg cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                  <Link href="/umre-rehber.html" className="flex flex-col gap-1 w-full p-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Map className="h-4 w-4 text-emerald-600" />
                      Haritalı Gezi Rehberi
                      <span className="ml-auto flex h-4 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[9px] font-bold text-emerald-700">YENİ</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">Tüm harita üzerinden keşfedin</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="mb-1 rounded-lg cursor-pointer focus:bg-amber-50 focus:text-amber-700">
                  <Link href="/sanal-tur" className="flex flex-col gap-1 w-full p-2">
                    <div className="flex items-center gap-2 font-medium">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      Sanal Tur & Siyer
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">Mekanların detaylı tarihçesi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-blue-50 focus:text-blue-700">
                  <Link href="/yasam-rehberi" className="flex flex-col gap-1 w-full p-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Yaşam Rehberi
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">Pratik yaşam ipuçları</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 text-sm font-medium text-foreground/80">
              Umre Rehberi
              <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200" />
            </div>
          )}

          <Link
            href="/about"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Hakkımızda
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
            href="tel:+908501234567"
            className="hidden xl:flex items-center gap-2 text-sm font-medium text-foreground/80 mr-4 transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4" />
            0850 123 45 67
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
        <div className="border-t border-border bg-card lg:hidden">
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
                  {session.user.role && (
                    <span className="text-xs text-primary font-semibold uppercase mt-0.5">
                      {session.user.role}
                    </span>
                  )}
                </div>
              </div>
            )}

            <Link
              href="/tours"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Umre Turları
            </Link>
            <Link
              href="/umre-rehber.html"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Umre Gezi Rehberi
            </Link>
            <div className="px-5 py-2">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Umre Rehberi Merkezi</div>
              <div className="flex flex-col gap-1 pl-2 border-l-2 border-primary/20">
                <Link
                  href="/rehber"
                  className="rounded-lg px-3 py-2 text-base font-medium text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📍 Ana Rehber Sayfası
                </Link>
                <Link
                  href="/umre-rehber.html"
                  className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🗺️ï¸ Haritalı Gezi Rehberi <span className="ml-2 inline-flex px-1.5 py-0.5 rounded bg-emerald-100 text-[10px] font-bold text-emerald-700">YENİ</span>
                </Link>
                <Link
                  href="/sanal-tur"
                  className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🕋 Sanal Tur & Siyer
                </Link>
                <Link
                  href="/yasam-rehberi"
                  className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  💡 Yaşam Rehberi
                </Link>
              </div>
            </div>
            <Link
              href="/about"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Hakkımızda
            </Link>
            <Link
              href="/contact"
              className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              İletişim
            </Link>

            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl px-5 py-3 text-lg font-medium text-foreground transition-colors hover:bg-secondary flex items-center gap-2"
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
                  className="rounded-xl px-5 py-3 text-lg font-medium text-red-500 transition-colors hover:bg-secondary flex items-center gap-2 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4 px-2">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>Giriş Yap</Link>
                </Button>
                <Button size="lg" asChild>
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
