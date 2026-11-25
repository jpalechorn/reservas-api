import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from '../errors/app-error';

interface TokenPayload {
  id: number;
  role: Role;
}

// Autenticacion: ¿quien eres? Sin token valido -> 401.
// No responde por su cuenta: le pasa el error al middleware de errores con next(...).
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token de autenticacion requerido', 'TOKEN_MISSING'));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Es un fallo de configuracion del servidor, no del cliente: 500.
    return next(new Error('JWT_SECRET no esta configurado'));
  }

  const token = authorization.split(' ')[1];

  try {
    // algorithms fija el algoritmo esperado: rechaza tokens sin firma ("alg": "none").
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as TokenPayload;

    if (!decoded || !Number.isInteger(decoded.id) || !Object.values(Role).includes(decoded.role)) {
      return next(new AppError(401, 'Token invalido', 'TOKEN_INVALID'));
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    next(new AppError(401, 'Token invalido o expirado', 'TOKEN_INVALID'));
  }
}
