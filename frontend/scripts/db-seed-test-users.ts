import { PrismaClient } from '../prisma/generated-client';
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedTestUsers() {
    console.log("🌱 Test Kullanıcıları Oluşturuluyor...");

    const passwordHash = await bcrypt.hash("password123", 10);

    const testUsers = [
        {
            email: "rehber1@test.com",
            name: "Test Rehber",
            fullName: "Test Rehber",
            role: "GUIDE" as const,
            isVerified: true,
            isIdentityVerified: true,
            packageType: "PREMIUM" as const,
            tokenBalance: 500,
            passwordHash,
            guideProfile: {
                create: {
                    experienceYears: 5,
                    languagesSpoken: ["Türkçe", "Arapça"],
                    specialties: ["Kültür Turları", "Hızlı Umre"],
                }
            }
        },
        {
            email: "acente1@test.com",
            name: "Test Acente",
            fullName: "Test Acente Limited",
            role: "ORGANIZATION" as const,
            isVerified: true,
            isIdentityVerified: true,
            packageType: "BUSINESS" as const,
            tokenBalance: 2500,
            passwordHash,
            tursabNumber: "12345",
            agencyCity: "İstanbul"
        },
        {
            email: "haci1@test.com",
            name: "Test Haci",
            fullName: "Test Haci Adayı",
            role: "USER" as const,
            isVerified: true,
            passwordHash,
            tokenBalance: 50
        }
    ];

    for (const userData of testUsers) {
        const { guideProfile, ...data } = userData;
        
        await prisma.user.upsert({
            where: { email: data.email },
            update: {
                ...data,
                guideProfile: guideProfile ? {
                    upsert: {
                        create: guideProfile.create,
                        update: guideProfile.create
                    }
                } : undefined
            },
            create: {
                ...data,
                guideProfile: guideProfile ? guideProfile : undefined
            }
        });
        console.log(`✅ Oluşturuldu/Güncellendi: ${data.email} (${data.role})`);
    }

    console.log("\n🚀 Test seeding tamamlandı. Giriş Şifresi: password123");
}

seedTestUsers()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
