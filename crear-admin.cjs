// Crea el usuario administrador de pruebas.
// Si ya existe, no lo modifica.
require('dotenv').config();

const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123*', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@reservas.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@reservas.com',
      password: passwordHash,
      role: Role.ADMIN
    }
  });

  console.log('Administrador creado o existente:');
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());