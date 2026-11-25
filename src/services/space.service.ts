import { prisma } from '../lib/prisma';
import type { Space } from '@prisma/client';

export async function listSpaces(): Promise<Space[]> {
  return prisma.space.findMany();
}

export async function listMySpaces(userId: number): Promise<Space[]> {
  return prisma.space.findMany({
    where: {
      ownerId: userId
    }
  });
}

export async function findSpaceById(id: number): Promise<Space | null> {
  return prisma.space.findUnique({
    where: { id }
  });
}

export async function createSpace(
  data: Omit<Space, 'id'>
): Promise<Space> {
  return prisma.space.create({
    data
  });
}

export async function updateSpace(
  id: number,
  userId: number,
  userRole: string,
  data: Partial<Omit<Space, 'id' | 'ownerId'>>
): Promise<Space> {

  // Primero verificamos que el espacio exista.
  const space = await findSpaceById(id);

  if (!space) {
    throw new Error('NOT_FOUND');
  }

  // El administrador puede modificar cualquier espacio.
  // El propietario solo puede modificar sus propios espacios.
  if (userRole !== 'ADMIN' && space.ownerId !== userId) {
    throw new Error('FORBIDDEN');
  }

  return prisma.space.update({
    where: { id },
    data
  });
}

export async function deleteSpace(
  id: number,
  userId: number,
  userRole: string
): Promise<void> {

  // Verificar que el espacio exista
  const space = await findSpaceById(id);

  if (!space) {
    throw new Error('NOT_FOUND');
  }

  // Verificar propietario o administrador
  if (userRole !== 'ADMIN' && space.ownerId !== userId) {
    throw new Error('FORBIDDEN');
  }

  await prisma.space.delete({
    where: { id }
  });
}