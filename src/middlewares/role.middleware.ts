import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../errors/app-error';

// Autorizacion por rol: ¿que puedes hacer? Rol que no esta en la lista -> 403.
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Usuario no autenticado', 'TOKEN_MISSING'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'No tienes permisos para realizar esta operacion', 'FORBIDDEN_ROLE'));
    }

    next();
  };
}
