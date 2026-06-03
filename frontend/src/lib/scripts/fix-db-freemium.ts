import { PrismaClient } from "../../../prisma/generated-client";

const prisma = new PrismaClient();

async function main() {
    const freemiumPackage = await prisma.creditPackage.findFirst({
        where: { slug: "FREEMIUM" }
    });

    if (!freemiumPackage) {
        console.log("FREEMIUM package not found");
        return;
    }

    console.log("Found FREEMIUM package:");
    console.log(JSON.stringify(freemiumPackage, null, 2));

    const features = freemiumPackage.features as any;
    console.log("Current canCreatePoster:", features?.canCreatePoster);

    if (features?.canCreatePoster === false) {
        const updatedFeatures = { ...features, canCreatePoster: true };
        await prisma.creditPackage.update({
            where: { id: freemiumPackage.id },
            data: { features: updatedFeatures }
        });
        console.log("Updated canCreatePoster to true");
    } else {
        console.log("canCreatePoster is already true or not set to false");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
