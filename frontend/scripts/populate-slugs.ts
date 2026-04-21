import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Mevcut kullanıcılar için slug üretim işlemi başlatılıyor...");

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: "GUIDE" },
        { role: "ORGANIZATION" }
      ]
    },
    select: {
      id: true,
      name: true,
      fullName: true
    }
  });

  console.log(`📦 ${users.length} kullanıcı bulundu.`);

  for (const user of users) {
    const displayName = user.fullName || user.name || `kullanici-${user.id.substring(0, 5)}`;
    const baseSlug = slugify(displayName);
    
    // Ensure uniqueness by appending ID if necessary (though slugify + cuid collision is rare)
    // For now we just use the base slug. If unique constraint fails, we'll know.
    
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { slug: baseSlug }
      });
      console.log(`✅ Güncellendi: ${displayName} -> ${baseSlug}`);
    } catch (error) {
       // If collision, append first 4 chars of ID
       const uniqueSlug = `${baseSlug}-${user.id.substring(0, 4)}`;
       await prisma.user.update({
         where: { id: user.id },
         data: { slug: uniqueSlug }
       });
       console.log(`⚠️ Çakışma önlendi: ${displayName} -> ${uniqueSlug}`);
    }
  }

  console.log("✨ İşlem başarıyla tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
