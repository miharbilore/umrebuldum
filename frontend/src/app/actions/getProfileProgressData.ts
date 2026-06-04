"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getProfileProgressData() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            phone: true,
            city: true,
            bio: true,
            image: true,
            hasClaimedProfileBonus: true,
            guideProfile: {
                select: {
                    experienceYears: true,
                    languagesSpoken: true,
                }
            }
        }
    });

    if (!user) return null;

    return {
        user: {
            name: user.name,
            phone: user.phone,
            city: user.city,
            bio: user.bio,
            image: user.image,
            hasClaimedProfileBonus: user.hasClaimedProfileBonus
        },
        guideProfile: user.guideProfile
    };
}
