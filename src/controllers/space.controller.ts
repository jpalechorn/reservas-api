import { Request, Response } from 'express';
import * as spaceService from '../services/space.service';

export function getAllSpaces(req: Request, res: Response) {
  res.status(200).json(spaceService.listSpaces());
}

export function getSpaceById(req: Request, res: Response) {
  const space = spaceService.findSpaceById(Number(req.params.id));
  if (!space) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(200).json(space);
}

export function createSpace(req: Request, res: Response) {
  const { name, capacity, location, type } = req.body ?? {};
  if (!name || !capacity || !location || !type) {
    return res.status(400).json({ error: 'name, capacity, location y type son obligatorios' });
  }
  const space = spaceService.createSpace({ name, capacity: Number(capacity), location, type });
  res.status(201).json(space);
}

export function updateSpace(req: Request, res: Response) {
  const { name, capacity, location, type } = req.body ?? {};
  const space = spaceService.updateSpace(Number(req.params.id), { name, capacity, location, type });
  if (!space) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(200).json(space);
}

export function deleteSpace(req: Request, res: Response) {
  const deleted = spaceService.deleteSpace(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(204).send();
}