import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-guards";

export async function GET(req: Request) {
    try {
        const session = await auth();
        const guard = requireAuth(session);
        if (guard) return guard;

        const userId = session!.user.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { guideProfile: true },
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({
            image: user.image,
            coverImage: user.coverImage,
            bio: user.bio,
            slug: user.slug,
            city: user.city,
            agencyCity: user.agencyCity,
            tursabNumber: user.tursabNumber,
            establishmentYear: user.establishmentYear,
            socialLinks: user.socialLinks,
            
            // Guide Specific Data
            languagesSpoken: user.guideProfile?.languagesSpoken,
            experienceYears: user.guideProfile?.experienceYears,
            specialties: user.guideProfile?.specialties,
            videoIntroduction: user.guideProfile?.videoIntroduction,
        });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireAuth(session);
        if (guard) return guard;

        const userId = session!.user.id;
        const data = await req.json();

        // Update User
        await prisma.user.update({
            where: { id: userId },
            data: {
                image: data.image !== undefined ? data.image : undefined,
                coverImage: data.coverImage !== undefined ? data.coverImage : undefined,
                bio: data.bio !== undefined ? data.bio : undefined,
                city: data.city !== undefined ? data.city : undefined,
                agencyCity: data.agencyCity !== undefined ? data.agencyCity : undefined,
                tursabNumber: data.tursabNumber !== undefined ? data.tursabNumber : undefined,
                establishmentYear: data.establishmentYear ? parseInt(data.establishmentYear) : undefined,
                socialLinks: data.socialLinks !== undefined ? data.socialLinks : undefined,
            }
        });

        // Update GuideProfile if relevant fields are passed
        if (data.languagesSpoken !== undefined || data.experienceYears !== undefined || 
            data.specialties !== undefined || data.videoIntroduction !== undefined) {
            
            await prisma.guideProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    languagesSpoken: data.languagesSpoken || [],
                    experienceYears: data.experienceYears ? parseInt(data.experienceYears) : 0,
                    specialties: data.specialties || [],
                    videoIntroduction: data.videoIntroduction || "",
                },
                update: {
                    languagesSpoken: data.languagesSpoken !== undefined ? data.languagesSpoken : undefined,
                    experienceYears: data.experienceYears !== undefined ? parseInt(data.experienceYears) : undefined,
                    specialties: data.specialties !== undefined ? data.specialties : undefined,
                    videoIntroduction: data.videoIntroduction !== undefined ? data.videoIntroduction : undefined,
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Güncelleme sırasında hata oluştu" }, { status: 500 });
    }
}
