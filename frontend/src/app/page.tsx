import { DynamicHeroSection } from "@/components/dynamic-hero-section";
import { GuideListingsSection } from "@/components/guide-listings-section";
import { TourCategoriesSection } from "@/components/tour-categories-section";
import { HowItWorks } from "@/components/how-it-works";
import { WhyUs } from "@/components/why-us";
import { CombinedGuideSection } from "@/components/combined-guide-section";
import { SampleItinerary } from "@/components/sample-itinerary";
import { CTASection } from "@/components/cta-section";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Umrebuldum - Güvenilir Umre Turları",
    description: "Güvenilir Umre turlarını keşfedin. Fiyatları karşılaştırın, yorumları okuyun ve turları inceleyin.",
    alternates: {
      canonical: "https://umrebuldum.com",
    },
    openGraph: {
      type: "website",
      url: "https://umrebuldum.com",
      title: "Umrebuldum - Güvenilir Umre Turları",
      description: "Güvenilir Umre turlarını keşfedin. Fiyatları karşılaştırın ve turları inceleyin.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Umrebuldum - Güvenilir Umre Turları",
      description: "Güvenilir Umre turlarını keşfedin. Fiyatları karşılaştırın ve turları inceleyin.",
    },
  };
}

export default function HomePage() {
  return (
    <>
      {/* 1. Arama Motoru */}
      <DynamicHeroSection />

      {/* 2. En İyi Umre Turları */}
      <GuideListingsSection />

      {/* 3. Tur Kategorileri (VIP, Ekonomik, Diyanet, Özel) */}
      <TourCategoriesSection />

      {/* 4. Nasıl Çalışır */}
      <HowItWorks />

      {/* 5. Neden Biz */}
      <WhyUs />

      {/* 6. Umre Rehberi & Keşif (Birleşik Bölüm) */}
      <CombinedGuideSection />

      {/* 7. Örnek Umre Programı */}
      <SampleItinerary />

      {/* 8. CTA Section */}
      <CTASection />
    </>
  );
}
