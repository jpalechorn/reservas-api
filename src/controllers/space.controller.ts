import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as spaceService from '../services/space.service';

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getAllSpaces(req: Request, res: Response) {
  const spaces = await spaceService.listSpaces();
  res.status(200).json(spaces);
}

export async function getSpaceById(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return res.status(400).json({ error: 'id inválido' });

  const space = await spaceService.findSpaceById(id);
  if (!space) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(200).json(space);
}

export async function createSpace(req: Request, res: Response) {
  const { name, capacity, location, type } = req.body ?? {};
  if (!name || !capacity || !location || !type) {
    return res.status(400).json({ error: 'name, capacity, location y type son obligatorios' });
  }
  try {
    const space = await spaceService.createSpace({ name, capacity: Number(capacity), location, type });
    res.status(201).json(space);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un espacio con ese nombre' });
    }
    throw e;
  }
}

export async function updateSpace(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return res.status(400).json({ error: 'id inválido' });

  const { name, capacity, location, type } = req.body ?? {};
  try {
    const space = await spaceService.updateSpace(id, {
      name,
      capacity: capacity !== undefined ? Number(capacity) : undefined,
      location,
      type,
    });
    if (!space) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }
    res.status(200).json(space);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un espacio con ese nombre' });
    }
    throw e;
  }
}

export async function deleteSpace(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return res.status(400).json({ error: 'id inválido' });

  const deleted = await spaceService.deleteSpace(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(204).send();
}