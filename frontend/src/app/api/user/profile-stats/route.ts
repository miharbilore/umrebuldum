import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireAuth } from '@/lib/api-guards';
import { calculateProfileCompletion, recalculateTrustScore } from '@/lib/services/trust-service';

export async function GET(req: Request) {
    const session = await auth();
    const authErr = requireAuth(session);
    if (authErr) return authErr;

    try {
        const userId = session!.user.id!;
        
        // 1. Fetch user data with necessary fields for completion
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                city: true,
                phone: true,
                isPhoneVerified: true,
                agencyCity: true,
                bio: true,
                photo: true,
                image: true,
                isIdentityVerified: true,
                role: true,
                trustScore: true,
                completedTrips: true,
                isApproved: true,
                // Include applications for approvalStatus check
                identityApplications: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        status: true
                    }
                },
                // Include guideProfile for trustScore calculation (rating)
                guideProfile: {
                    select: {
                        averageRating: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Compute completion
        const completion = calculateProfileCompletion(user as any);

        return NextResponse.json({
            completion,
            trustScore: user.trustScore,
            completedTrips: user.completedTrips,
        });
    } catch (error) {
        console.error("Profile stats fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
