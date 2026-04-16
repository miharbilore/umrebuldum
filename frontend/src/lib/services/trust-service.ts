import { prisma } from "@/lib/prisma";
import { User, UserRole } from "@prisma/client";

export interface ProfileCompletionResult {
    percentage: number;
    missingStep: {
        label: string;
        link: string;
    } | null;
}

/**
 * Calculates profile completion percentage based on weighted criteria.
 * 
 * Logic (100% Total):
 * 1. Identity (20%): fullName (10%) + city (10%)
 * 2. Communication (20%): phone (10%) + isPhoneVerified (10%)
 * 3. Professionalism (30%):
 *    - GUIDE/ORGANIZATION: agencyCity (15%) + bio (15%)
 *    - USER: bio (30%)
 * 4. Visual (10%): photo (10%)
 * 5. Verification (20%): isIdentityVerified (20%)
 */
export function calculateProfileCompletion(user: Partial<User>): ProfileCompletionResult {
    let score = 0;
    const steps: { label: string; link: string; completed: boolean; weight: number }[] = [];

    // 1. Identity (20%)
    const hasFullName = !!user.fullName && user.fullName.length > 2;
    const hasCity = !!user.city;
    score += hasFullName ? 10 : 0;
    score += hasCity ? 10 : 0;
    
    steps.push({ label: "Ad Soyad", link: "/dashboard/profile", completed: hasFullName, weight: 10 });
    steps.push({ label: "Yaşadığınız Şehir", link: "/dashboard/profile", completed: hasCity, weight: 10 });

    // 2. Communication (20%)
    const hasPhone = !!user.phone && user.phone.length > 5;
    const isPhoneVerified = !!user.isPhoneVerified;
    score += hasPhone ? 10 : 0;
    score += isPhoneVerified ? 10 : 0;

    steps.push({ label: "Telefon Numarası", link: "/dashboard/profile", completed: hasPhone, weight: 10 });
    steps.push({ label: "Telefon Doğrulama", link: "/dashboard/settings", completed: isPhoneVerified, weight: 10 });

    // 3. Professionalism (30%)
    const isGuideOrOrg = user.role === UserRole.GUIDE || user.role === UserRole.ORGANIZATION;
    if (isGuideOrOrg) {
        const hasAgencyCity = !!user.agencyCity;
        const hasBio = !!user.bio && user.bio.length >= 50;
        score += hasAgencyCity ? 15 : 0;
        score += hasBio ? 15 : 0;
        steps.push({ label: "Faaliyet Şehri", link: "/dashboard/profile", completed: hasAgencyCity, weight: 15 });
        steps.push({ label: "Hakkımda (Bio)", link: "/dashboard/profile", completed: hasBio, weight: 15 });
    } else {
        const hasBio = !!user.bio && user.bio.length >= 20;
        score += hasBio ? 30 : 0;
        steps.push({ label: "Kısa Bilgi (Bio)", link: "/dashboard/profile", completed: hasBio, weight: 30 });
    }

    // 4. Visual (10%)
    const hasPhoto = !!user.photo || !!user.image;
    score += hasPhoto ? 10 : 0;
    steps.push({ label: "Profil Fotoğrafı", link: "/dashboard/profile", completed: hasPhoto, weight: 10 });

    // 5. Verification (20%)
    const isIdentityVerified = !!user.isIdentityVerified;
    score += isIdentityVerified ? 20 : 0;
    steps.push({ label: "Kimlik Onayı", link: "/dashboard/settings", completed: isIdentityVerified, weight: 20 });

    // Find the most "valuable" missing step for the Smart CTA
    const missing = steps
        .filter(s => !s.completed)
        .sort((a, b) => b.weight - a.weight)[0];

    return {
        percentage: Math.min(score, 100),
        missingStep: missing ? { label: missing.label, link: missing.link } : null
    };
}

/**
 * Re-calculates trustScore and updates the database.
 * 
 * Logic (100p Total):
 * 1. ID Verified: 60p
 * 2. Ratings (Avg * 6): max 30p (5 * 6 = 30)
 * 3. Activity (Trips * 2): max 10p (5+ trips)
 */
export async function recalculateTrustScore(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            guideProfile: true
        }
    });

    if (!user) return 0;

    let trustScore = 0;

    // 1. ID Verification (60p)
    if (user.isIdentityVerified) {
        trustScore += 60;
    }

    // 2. Rating (30p)
    const avgRating = user.guideProfile?.averageRating || 0;
    trustScore += Math.round(Number(avgRating) * 6);

    // 3. Activity (10p)
    const trips = user.completedTrips || 0;
    trustScore += Math.min(trips * 2, 10);

    // Final clamp
    trustScore = Math.min(trustScore, 100);

    // Update DB
    await prisma.user.update({
        where: { id: userId },
        data: { 
            trustScore,
            trustScoreVersion: { increment: 1 }
        }
    });

    return trustScore;
}
