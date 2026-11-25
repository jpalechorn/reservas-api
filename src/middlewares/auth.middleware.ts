import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

interface TokenPayload {
  id: number;
  role: Role;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token de autenticación requerido'
    });
  }

  const token = authorization.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (
      !decoded ||
      !Number.isInteger(decoded.id) ||
      !Object.values(Role).includes(decoded.role)
    ) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();

  } catch {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
}