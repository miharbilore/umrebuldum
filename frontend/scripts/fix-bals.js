const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    const users = await prisma.user.findMany({ where: { email: { contains: "testsuite" } } });
    for (const u of users) {
        if (u.tokenBalance > 0) {
            const exists = await prisma.tokenTransaction.findFirst({ where: { userId: u.id } });
            if (!exists) {
                await prisma.tokenTransaction.create({
                    data: {
                        userId: u.id,
                        entryType: "ADJUSTMENT",
                        amount: u.tokenBalance,
                        reasonCode: "INITIAL_BALANCE",
                        remainingAmount: u.tokenBalance,
                        idempotencyKey: "init_" + u.id
                    }
                });
                console.log("Fixed ledger for " + u.email);
            }
        }
    }
}
fix().then(() => process.exit(0));
