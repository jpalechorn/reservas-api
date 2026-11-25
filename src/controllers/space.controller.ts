import { Request, Response } from 'express';
import * as spaceService from '../services/space.service';

// Sin try/catch y sin if de validacion: Zod valida body e id antes, el Service lanza AppError
// y errorMiddleware responde. Express 5 envia solo al middleware de errores lo que lance
// una funcion async.
// req.user siempre existe en las rutas protegidas: lo deja requireAuth.

export async function getAllSpaces(_req: Request, res: Response) {
  return res.status(200).json(await spaceService.listSpaces());
}

export async function getMySpaces(req: Request, res: Response) {
  return res.status(200).json(await spaceService.listMySpaces(req.user!.id));
}

export async function getSpaceById(req: Request, res: Response) {
  return res.status(200).json(await spaceService.findSpaceById(Number(req.params.id)));
}

export async function createSpace(req: Request, res: Response) {
  const space = await spaceService.createSpace(req.body, req.user!.id);
  return res.status(201).json(space);
}

export async function updateSpace(req: Request, res: Response) {
  const { id, role } = req.user!;
  const space = await spaceService.updateSpace(Number(req.params.id), id, role, req.body);
  return res.status(200).json(space);
}

export async function deleteSpace(req: Request, res: Response) {
  const { id, role } = req.user!;
  await spaceService.deleteSpace(Number(req.params.id), id, role);
  return res.status(204).send();
}
