import { prisma } from '../lib/prisma';
import type { Role, Space } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { CreateSpaceBody, UpdateSpaceBody } from '../schemas/space.schema';

const noEncontrado = () => new AppError(404, 'Espacio no encontrado', 'SPACE_NOT_FOUND');

export async function listSpaces(): Promise<Space[]> {
  return prisma.space.findMany();
}

export async function listMySpaces(userId: number): Promise<Space[]> {
  return prisma.space.findMany({ where: { ownerId: userId } });
}

export async function findSpaceById(id: number): Promise<Space> {
  const space = await prisma.space.findUnique({ where: { id } });
  if (!space) throw noEncontrado();
  return space;
}

// El ownerId sale del usuario autenticado, nunca del body.
// Si el nombre ya existe, Prisma lanza P2002 y el middleware de errores responde 409.
export async function createSpace(data: CreateSpaceBody, ownerId: number): Promise<Space> {
  return prisma.space.create({ data: { ...data, ownerId } });
}

// Autorizacion por dueño del recurso: primero 404 (si no existe) y despues 403.
// El ADMIN puede modificar cualquier espacio; el OWNER solo los suyos.
async function assertOwner(id: number, userId: number, userRole: Role): Promise<void> {
  const space = await findSpaceById(id);
  if (userRole !== 'ADMIN' && space.ownerId !== userId) {
    throw new AppError(403, 'No tienes permiso para modificar este espacio', 'NOT_SPACE_OWNER');
  }
}

export async function updateSpace(
  id: number,
  userId: number,
  userRole: Role,
  data: UpdateSpaceBody
): Promise<Space> {
  await assertOwner(id, userId, userRole);
  return prisma.space.update({ where: { id }, data });
}

export async function deleteSpace(id: number, userId: number, userRole: Role): Promise<void> {
  await assertOwner(id, userId, userRole);
  await prisma.space.delete({ where: { id } });
}
