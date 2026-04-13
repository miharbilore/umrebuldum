import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import NewsletterPopup from "@/components/NewsletterPopup";
import HybridChatbot from "@/components/HybridChatbot";
import "./globals.css";
import 'react-phone-number-input/style.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";

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

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased flex flex-col min-h-screen`}>
        <SmoothScrollProvider>
          <Providers session={session}>
            <Header />
            <main className="flex-1 bg-gray-50">{children}</main>
            <Footer />
            <NewsletterPopup />
            <HybridChatbot />
            <Analytics />
            <Toaster position="top-right" richColors closeButton />
          </Providers>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

