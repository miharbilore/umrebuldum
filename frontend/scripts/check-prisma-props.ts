import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkProps() {
    const props = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    console.log("Available Prisma models:", props.join(", "));
}

checkProps();
