const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function runScenario() {
    console.log("🚀 Starting E2E Scenario Test with Credentials...");

    try {
        const passwordHash = await bcrypt.hash("test1234", 10);

        // 1. CLEAR PREVIOUS TEST DATA
        await prisma.user.deleteMany({ where: { email: { contains: "testsuite" } } });
        console.log("✅ Cleared old test data.");

        // 2. CREATE ADMIN
        const admin = await prisma.user.create({
            data: {
                name: "Admin Test",
                email: "admin_testsuite@umrebuldum.com",
                passwordHash,
                role: "ADMIN",
                isVerified: true,
                isApproved: true
            }
        });
        console.log(`✅ Admin created: ${admin.id}`);

        // 3. CREATE GUIDE
        const guide = await prisma.user.create({
            data: {
                name: "Rehber Test",
                email: "guide_testsuite@umrebuldum.com",
                passwordHash,
                role: "GUIDE",
                packageType: "PREMIUM",
                tokenBalance: 100,
                isVerified: true,
                isApproved: true,
                guideProfile: {
                    create: {
                        fullName: "Rehber Test",
                        city: "İstanbul",
                        isApproved: true
                    }
                }
            }
        });
        console.log(`✅ Guide created: ${guide.id}`);

        // 4. CREATE ORGANIZATION
        const org = await prisma.user.create({
            data: {
                name: "Kurumsal Test",
                email: "org_testsuite@umrebuldum.com",
                passwordHash,
                role: "ORGANIZATION",
                packageType: "PROFESSIONAL",
                tokenBalance: 500,
                isVerified: true,
                isApproved: true,
                guideProfile: {
                    create: {
                        fullName: "Kurumsal Test Acentesi",
                        city: "Ankara",
                        isApproved: true
                    }
                }
            }
        });
        console.log(`✅ Organization created: ${org.id}`);

        // 5. CREATE USER (UMRECİ)
        const user = await prisma.user.create({
            data: {
                name: "Umreci Test",
                email: "user_testsuite@umrebuldum.com",
                passwordHash,
                role: "USER",
                isVerified: true
            }
        });
        console.log(`✅ User created: ${user.id}`);

        // 6. GUIDE CREATES A LISTING
        const listing = await prisma.guideListing.create({
            data: {
                guideId: guide.id,
                title: "Test Umre Turu 2026",
                description: "Test amaçlı oluşturulmuş tur açıklaması.",
                city: "Mekke",
                pricingDouble: 1500,
                pricingCurrency: "USD",
                startDate: new Date(Date.now() + 86400000 * 30),
                endDate: new Date(Date.now() + 86400000 * 45),
                approvalStatus: "PENDING"
            }
        });
        console.log(`✅ Guide Listing created: ${listing.id}`);

        // 7. ORG CREATES A LISTING
        const orgListing = await prisma.guideListing.create({
            data: {
                guideId: org.id,
                title: "VIP Kurumsal Tur 2026",
                description: "Kurumsal VIP tur açıklaması.",
                city: "Medine",
                pricingDouble: 2500,
                pricingCurrency: "USD",
                startDate: new Date(Date.now() + 86400000 * 20),
                endDate: new Date(Date.now() + 86400000 * 35),
                approvalStatus: "APPROVED" // approved directly to test view
            }
        });
        console.log(`✅ Organization Listing created: ${orgListing.id}`);

        // 8. USER CREATES A REQUEST (TALEP)
        const request = await prisma.umrahRequest.create({
            data: {
                userEmail: user.email,
                departureCity: "İstanbul",
                peopleCount: 2,
                dateRange: "Ramazan 2026",
                status: "open"
            }
        });
        console.log(`✅ User Request created: ${request.id}`);

        const request2 = await prisma.umrahRequest.create({
            data: {
                userEmail: user.email,
                departureCity: "Ankara",
                peopleCount: 4,
                dateRange: "Şevval 2026",
                status: "open"
            }
        });
        console.log(`✅ User Request 2 created: ${request2.id}`);

        console.log("🎉 Test accounts are ready with password 'test1234'!");

    } catch (error) {
        console.error("❌ E2E Scenario Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runScenario();
