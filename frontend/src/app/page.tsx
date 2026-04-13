import { DynamicHeroSection } from "@/components/dynamic-hero-section";
import { GuideListingsSection } from "@/components/guide-listings-section";
import { SanalTurPreview } from "@/components/sanal-tur-preview";
import { HowItWorks } from "@/components/how-it-works";
import { WhyUs } from "@/components/why-us";
import { YasamRehberiPreview } from "@/components/yasam-rehberi-preview";
import { SampleItinerary } from "@/components/sample-itinerary";
import { CTASection } from "@/components/cta-section";

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
