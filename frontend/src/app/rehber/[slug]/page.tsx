import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/profile/hero-section";
import { ProfileHeader } from "@/components/profile/profile-header";
import { AboutSection } from "@/components/profile/about-section";
import { ContactCard } from "@/components/profile/contact-card";

async function getProfileData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            guideProfile: true,
        }
    });

    if (!user) return null;
    return user;
}

// Generate Dynamic Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    // Extract ID from [id]-[slug] structure
    const id = resolvedParams.slug.split("-")[0];
    const user = await getProfileData(id);

    if (!user) {
        return {
            title: "Profil Bulunamadı | Umrebuldum",
            description: "Aradığınız rehber veya acente profiline ulaşılamadı.",
        };
    }

    const titleSuffix = user.role === "ORGANIZATION" ? "Kurumsal Acente" : user.role === "GUIDE" ? "Onaylı Rehber" : "Profil";
    const name = user.fullName || user.name || "Kullanıcı";

    return {
        title: `${name} - Umrebuldum ${titleSuffix}`,
        description: `${name} adlı Umrebuldum onaylı ${titleSuffix.toLowerCase()}'in detaylı profilini, güncel turlarını, puanlarını ve uzmanlık tecrübelerini inceleyin.`,
        openGraph: {
            images: [user.coverImage || user.image || ""],
        }
    };
}

export default async function PublicProfilePage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    // Extract ID from [id]-[slug] structure
    const id = params.slug.split("-")[0];

    const user = await getProfileData(id);

    if (!user) {
        notFound();
    }

    const { guideProfile } = user;

    // Computed values
    const name = user.fullName || user.name || "Kullanıcı";
    const coverImage = user.coverImage || "https://images.unsplash.com/photo-1565552643952-4a14ceb3662d?q=80&w=1200&auto=format&fit=crop"; 
    const avatar = user.image || user.photo || "";

    const languages = guideProfile?.languagesSpoken && Array.isArray(guideProfile.languagesSpoken)
        ? guideProfile.languagesSpoken as string[]
        : [];

    const specialties = guideProfile?.specialties && Array.isArray(guideProfile.specialties)
        ? guideProfile.specialties as string[]
        : [];

    const trustScore = Math.min(user.trustScore, 100);
    const isVerified = user.isIdentityVerified && trustScore >= 80;
    const avgRating = guideProfile?.averageRating ? Number(guideProfile.averageRating) : 0;
    const reviewCount = guideProfile?.reviewCount || 0;
    const experienceYears = guideProfile?.experienceYears || 0;
    
    // For Header
    const title = user.role === "ORGANIZATION" 
      ? "Sertifikalı Umre Acentesi" 
      : user.role === "GUIDE" 
        ? "Rehber & Umre Danışmanı" 
        : "Umreci";

    return (
      <main className="min-h-screen bg-background">
        <HeroSection 
          coverImage={coverImage} 
          avatar={avatar} 
          name={name}
          isVerified={isVerified}
        />
        
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <ProfileHeader 
            name={name}
            title={title}
            trustScore={trustScore}
            avgRating={avgRating}
            reviewCount={reviewCount}
            languages={languages}
            experienceYears={experienceYears}
          />
          
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AboutSection 
                bio={user.bio}
                specialties={specialties}
                completedTrips={user.completedTrips}
                reviewCount={reviewCount}
              />
            </div>
            <div className="lg:col-span-1">
              <ContactCard 
                name={name}
                city={user.city}
                agencyCity={user.agencyCity}
                isVerified={isVerified}
              />
            </div>
          </div>
        </div>
      </main>
    );
}
