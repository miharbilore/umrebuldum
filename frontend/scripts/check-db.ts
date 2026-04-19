import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const reqs = await prisma.umrahRequest.findMany({ where: { userEmail: "user_testsuite@umrebuldum.com" } });
    for (const r of reqs) {
        const offers = await prisma.offer.findMany({ where: { requestId: r.id } });
        console.log(`Request ${r.id} has ${offers.length} offers.`);
        for (const o of offers) {
            console.log(`  - Offer from Guide ${o.guideId}: ${o.price} ${o.currency}`);
        }
    }

    // also check balances
    const users = await prisma.user.findMany({ where: { email: { contains: "testsuite" } } });
    for (const u of users) {
        if (u.role === "GUIDE" || u.role === "ORGANIZATION") {
            console.log(`${u.role} (${u.email}) balance: ${u.tokenBalance}`);
        }
    }
}
check().then(() => process.exit(0));
