import { HeroSection } from "@/components/profile/hero-section"
import { ProfileHeader } from "@/components/profile/profile-header"
import { AboutSection } from "@/components/profile/about-section"
import { ContactCard } from "@/components/profile/contact-card"
// import { ToursSection } from "@/components/profile/tours-section"
// import { ReviewsSection } from "@/components/profile/reviews-section"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <ProfileHeader />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AboutSection />
          </div>
          <div className="lg:col-span-1">
            <ContactCard />
          </div>
        </div>
        {/* <ToursSection /> */}
        {/* <ReviewsSection /> */}
      </div>
    </main>
  )
}
