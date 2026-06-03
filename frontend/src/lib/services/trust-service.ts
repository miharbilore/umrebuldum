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
/**
 * Calculates profile completion percentage based on specific user requirements.
 * 
 * Logic:
 * 1. Role & Name present: 40%
 * 2. Phone & City present: 60%
 * 3. Bio & Identity Application present: 80%
 * 4. approvalStatus === 'APPROVED': 100%
 */
export function calculateProfileCompletion(user: any): ProfileCompletionResult {
    let percentage = 0;
    let missingStep = null;

    const hasRoleAndName = !!(user.role && user.fullName);
    const hasPhoneAndCity = !!(user.phone && user.city);
    const hasBioAndDocs = !!(user.bio && user.identityApplications?.length > 0);
    
    // Check for approved status from the latest application
    const latestApp = user.identityApplications?.[0];
    const isApproved = user.isApproved || latestApp?.status === "APPROVED";
    const isPending = latestApp?.status === "PENDING";

    if (hasRoleAndName) {
        percentage = 40;
        missingStep = { label: "İletişim Bilgilerini Tamamla", link: "/dashboard/profile" };
    } else {
        return {
            percentage: 0,
            missingStep: { label: "Temel Bilgileri Gir", link: "/dashboard/profile" }
        };
    }

    if (hasPhoneAndCity) {
        percentage = 60;
        missingStep = { label: "Özgeçmiş ve Belgeleri Yükle", link: "/dashboard/profile" };
    }

    if (hasBioAndDocs) {
        percentage = 80;
        missingStep = { label: "Onay Bekleniyor", link: "/dashboard/settings" };
    }

    if (isApproved) {
        percentage = 100;
        missingStep = null;
    }

    return {
        percentage,
        missingStep,
        // Adding extra info for the UI
        approvalStatus: isApproved ? "APPROVED" : (isPending ? "PENDING" : "NONE")
    } as any;
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
