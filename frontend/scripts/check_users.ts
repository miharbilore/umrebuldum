import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const emails = [
        'admin@umrebuldum.com',
        'rehber@umrebuldum.com',
        'umreci@umrebuldum.com',
        'kurumsal@umrebuldum.com'
    ];
    
    for (const email of emails) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, role: true, isVerified: true, passwordHash: true }
        });
        
        if (user) {
            console.log(`FOUND: ${email} | role=${user.role} | verified=${user.isVerified} | hasPassword=${!!user.passwordHash}`);
        } else {
            console.log(`NOT FOUND: ${email}`);
        }
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => { console.error(e); prisma.$disconnect(); });
