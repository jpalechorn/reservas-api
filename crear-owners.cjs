require('dotenv').config();

const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('OwnerPrueba123*', 10);

  const owners = [
    {
      name: 'Propietario Uno',
      email: 'owner1@reservas.com'
    },
    {
      name: 'Propietario Dos',
      email: 'owner2@reservas.com'
    }
  ];

  for (const owner of owners) {
    await prisma.user.upsert({
      where: { email: owner.email },
      update: { role: Role.OWNER },
      create: {
        ...owner,
        password,
        role: Role.OWNER
      }
    });
  }

  console.log('Usuarios OWNER creados correctamente.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());