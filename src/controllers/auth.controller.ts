import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

// Los datos ya llegan validados y limpios por Zod (validate) y los errores los responde
// errorMiddleware: el controlador no tiene try/catch ni if de validacion.

export async function register(req: Request, res: Response) {
  const user = await authService.registerUser(req.body);
  return res.status(201).json({ message: 'Usuario registrado correctamente', user });
}

export async function login(req: Request, res: Response) {
  const result = await authService.loginUser(req.body);
  return res.status(200).json(result);
}
