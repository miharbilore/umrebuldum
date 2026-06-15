import React from "react"
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import NewsletterPopup from "@/components/NewsletterPopup";
import HybridChatbot from "@/components/HybridChatbot";
import "./globals.css";
import 'react-phone-number-input/style.css'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "Umrebuldum - Güvenilir Umre Turları",
      template: "%s | Umrebuldum",
    },
    description: "Güvenilir Umre turlarını keşfedin. Fiyatları karşılaştırın, yorumları okuyun ve turları inceleyin.",
    keywords: [
      "Umre",
      "Umre turu",
      "hac",
      "Mekke",
      "Medine",
      "Kabe",
      "İslami seyahat",
      "Türkiye Umre turları",
      "Umre seyahati",
    ],
    authors: [{ name: "Umrebuldum" }],
    creator: "Umrebuldum",
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: "https://umrebuldum.com",
      siteName: "Umrebuldum",
      title: "Umrebuldum - Güvenilir Umre Turları",
      description: "Güvenilir Umre turlarını keşfedin. Fiyatları karşılaştırın ve turları inceleyin.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Umrebuldum - Güvenilir Umre Turları",
      description: "Güvenilir Umre turlarını keşfedin. Fiyatları karşılaştırın ve turları inceleyin.",
    },
    robots: {
      index: true,
      follow: true,
    },
    generator: 'v0.app'
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { Toaster } from 'sonner';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { ShieldAlert } from "lucide-react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("Auth failed in RootLayout:", e);
  }

  // Check Maintenance Mode
  let maintenanceMode = false;
  try {
      const setting = await prisma.systemSetting.findUnique({ where: { key: "maintenance_mode" } });
      if (setting?.value === "true") maintenanceMode = true;
  } catch(e) {}

  const isAdmin = session?.user?.role === "ADMIN";

  if (maintenanceMode && !isAdmin) {
      return (
          <html lang="tr" suppressHydrationWarning>
            <body className="font-sans antialiased flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
               <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                   <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                       <ShieldAlert className="w-8 h-8" />
                   </div>
                   <h1 className="text-2xl font-bold text-gray-900">Sistem Bakımda</h1>
                   <p className="text-gray-600">
                       Platformumuzda planlı bir altyapı güncellemesi yapılmaktadır. Daha iyi bir deneyim sunabilmek için kısa süreliğine kapalıyız. Lütfen daha sonra tekrar deneyin.
                   </p>
                   <p className="text-sm text-gray-400">Sabrınız için teşekkür ederiz.</p>
               </div>
            </body>
          </html>
      );
  }

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <SmoothScrollProvider>
          <Providers session={session}>
            <Header />
            <main className="flex-1 bg-gray-50">{children}</main>
            <Footer />
          </Providers>
        </SmoothScrollProvider>
        <NewsletterPopup />
        <HybridChatbot />
        <Analytics />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
