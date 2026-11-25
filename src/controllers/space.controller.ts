import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as spaceService from '../services/space.service';

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getAllSpaces(req: Request, res: Response) {
  const spaces = await spaceService.listSpaces();
  return res.status(200).json(spaces);
}

export async function getMySpaces(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  const spaces = await spaceService.listMySpaces(userId);

  return res.status(200).json(spaces);
}
export async function getSpaceById(req: Request, res: Response) {
  const id = parseId(req);

  if (!id) {
    return res.status(400).json({ error: 'id inválido' });
  }

  const space = await spaceService.findSpaceById(id);

  if (!space) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }

  return res.status(200).json(space);
}

export async function createSpace(req: Request, res: Response) {
  const { name, capacity, location, type } = req.body ?? {};

  if (!name || !capacity || !location || !type) {
    return res.status(400).json({
      error: 'name, capacity, location y type son obligatorios'
    });
  }

  const ownerId = req.user?.id;

  if (!ownerId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  try {
    const space = await spaceService.createSpace({
      name,
      capacity: Number(capacity),
      location,
      type,
      ownerId
    });

    return res.status(201).json(space);

  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return res.status(409).json({
        error: 'Ya existe un espacio con ese nombre'
      });
    }

    throw e;
  }
}

export async function updateSpace(req: Request, res: Response) {
  const id = parseId(req);

  if (!id) {
    return res.status(400).json({ error: 'id inválido' });
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  const { name, capacity, location, type } = req.body ?? {};

  try {
    const space = await spaceService.updateSpace(
      id,
      userId,
      userRole,
      {
        name,
        capacity: capacity !== undefined ? Number(capacity) : undefined,
        location,
        type
      }
    );

    return res.status(200).json(space);

  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({
        error: 'Espacio no encontrado'
      });
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return res.status(403).json({
        error: 'No tienes permiso para modificar este espacio'
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        error: 'Ya existe un espacio con ese nombre'
      });
    }

    console.error(error);

    return res.status(500).json({
      error: 'Error al actualizar el espacio'
    });
  }
}

export async function deleteSpace(req: Request, res: Response) {
  const id = parseId(req);

  if (!id) {
    return res.status(400).json({
      error: 'id inválido'
    });
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  try {
    await spaceService.deleteSpace(id, userId, userRole);

    return res.status(204).send();

  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({
        error: 'Espacio no encontrado'
      });
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar este espacio'
      });
    }

    console.error(error);

    return res.status(500).json({
      error: 'Error al eliminar el espacio'
    });
  }
}