import { DynamicHeroSection } from "@/components/dynamic-hero-section";
import { GuideListingsSection } from "@/components/guide-listings-section";
import { SanalTurPreview } from "@/components/sanal-tur-preview";
import { HowItWorks } from "@/components/how-it-works";
import { WhyUs } from "@/components/why-us";
import { YasamRehberiPreview } from "@/components/yasam-rehberi-preview";
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
      <DynamicHeroSection />
      <GuideListingsSection />
      <SanalTurPreview />
      <HowItWorks />
      <WhyUs />
      <YasamRehberiPreview />
      <SampleItinerary />
      <CTASection />
    </>
  );
}
