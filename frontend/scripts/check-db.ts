import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.guideArticle.count();
  console.log(`Current GuideArticle count: ${count}`);
  const slugs = await prisma.guideArticle.findMany({ select: { slug: true } });
  console.log('Slugs in DB:', slugs.map(s => s.slug).join(', '));
}
main().finally(() => prisma.$disconnect());
