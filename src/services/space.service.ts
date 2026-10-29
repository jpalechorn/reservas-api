import { prisma } from '../lib/prisma';
import type { Space } from '@prisma/client';

export async function listSpaces(): Promise<Space[]> {
  return prisma.space.findMany();
}

export async function findSpaceById(id: number): Promise<Space | null> {
  return prisma.space.findUnique({ where: { id } });
}

export async function createSpace(data: Omit<Space, 'id'>): Promise<Space> {
  return prisma.space.create({ data });
}

export async function updateSpace(
  id: number,
  data: Partial<Omit<Space, 'id'>>
): Promise<Space | null> {
  const exists = await findSpaceById(id);
  if (!exists) return null;
  return prisma.space.update({ where: { id }, data });
}

export async function deleteSpace(id: number): Promise<boolean> {
  const exists = await findSpaceById(id);
  if (!exists) return false;
  await prisma.space.delete({ where: { id } });
  return true;
}