const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const usuarios = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    const espacios = await prisma.space.findMany({
        select: {
            id: true,
            name: true,
            ownerId: true
        }
    });

    console.log('USUARIOS:');
    console.table(usuarios);

    console.log('ESPACIOS:');
    console.table(espacios);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());