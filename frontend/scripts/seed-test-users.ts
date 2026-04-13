/**
 * seed-test-users.ts
 * ------------------
 * "Büyük Test Fazı" için test kullanıcılarını Prisma üzerinden seed eder.
 *
 * Kullanım:
 *   npx tsx scripts/seed-test-users.ts
 */

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_PASSWORD = "Test1234!";

interface TestUser {
  email: string;
  name: string;
  role: UserRole;
  isIdentityVerified?: boolean;
  tokenBalance?: number;
  isVerified: boolean;
  isApproved?: boolean;
}

const testUsers: TestUser[] = [
  {
    email: "admin_test_01@umrebuldum.com",
    name: "Admin Test 01",
    role: UserRole.ADMIN,
    isVerified: true,
  },
  {
    email: "rehber_onayli_01@umrebuldum.com",
    name: "Rehber Onaylı 01",
    role: UserRole.GUIDE,
    isIdentityVerified: true,
    isApproved: true,
    tokenBalance: 500,
    isVerified: true,
  },
  {
    email: "rehber_bekleyen_02@umrebuldum.com",
    name: "Rehber Bekleyen 02",
    role: UserRole.USER, // Status: PENDING — Rehber başvurusu henüz onaylanmamış
    isVerified: true,
  },
  {
    email: "musteri_google_test@gmail.com",
    name: "Müşteri Google Test",
    role: UserRole.USER,
    isVerified: true,
  },
];

async function main() {
  console.log("🌱 Test kullanıcıları seed ediliyor...\n");

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);

  for (const u of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (existing) {
      console.log(`⏭️  Zaten mevcut: ${u.email} (güncelleniyor)`);
      await prisma.user.update({
        where: { email: u.email },
        data: {
          name: u.name,
          role: u.role,
          passwordHash: hashedPassword,
          isVerified: u.isVerified,
          isIdentityVerified: u.isIdentityVerified ?? false,
          isApproved: u.isApproved ?? false,
          tokenBalance: u.tokenBalance ?? 0,
          bio: u.role === "GUIDE" ? "Test rehber profili" : undefined,
        },
      });
    } else {
      console.log(`✅ Oluşturuluyor: ${u.email} (${u.role})`);
      const user = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
          passwordHash: hashedPassword,
          isVerified: u.isVerified,
          isIdentityVerified: u.isIdentityVerified ?? false,
          isApproved: u.isApproved ?? false,
          tokenBalance: u.tokenBalance ?? 0,
          bio: u.role === "GUIDE" ? "Test rehber profili" : undefined,
        },
      });

      // Rehber rolündeki kullanıcılar için GuideProfile oluştur
      if (u.role === "GUIDE") {
        await prisma.guideProfile.create({
          data: {
            userId: user.id,
          },
        });
        console.log(`   └─ GuideProfile oluşturuldu`);
      }
    }
  }

  console.log("\n✅ Tüm test kullanıcıları hazır!");
  console.log(`   Şifre: ${TEST_PASSWORD}`);
  console.log("\n📋 Kullanıcı listesi:");
  console.table(
    testUsers.map((u) => ({
      Email: u.email,
      Rol: u.role,
      "Kimlik Onaylı": u.isIdentityVerified ? "✅" : "❌",
      "Token Bakiye": u.tokenBalance ?? 0,
    }))
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
