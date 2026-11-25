import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';

// Ruta que no existe: se convierte en un error mas, con el mismo formato.
export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `No existe la ruta ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

// Middleware de errores: Express lo reconoce porque tiene CUATRO parametros.
// Debe montarse al FINAL de index.ts, despues de todas las rutas.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // 1. Errores esperados de nuestra API (400, 401, 403, 404, 409)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) }
    });
  }

  // 2. JSON mal escrito en el body (lo lanza express.json)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'El cuerpo de la peticion no es un JSON valido' }
    });
  }

  // 3. Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: { code: 'DUPLICATE', message: 'Ya existe un registro con ese valor unico' }
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Registro no encontrado' } });
    }
    if (err.code === 'P2003') {
      // Referencia a un registro que no existe, o borrar algo de lo que otros dependen
      return res.status(409).json({
        error: { code: 'RELATION_CONFLICT', message: 'La operacion viola una relacion entre registros' }
      });
    }
  }

  // 4. La base de datos no responde (al arrancar, o se cayo la conexion: P1001, P1002, P1017)
  const sinBase = ['P1001', 'P1002', 'P1017'];
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError && sinBase.includes(err.code))
  ) {
    console.error(err);
    return res.status(503).json({
      error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio no disponible, intente mas tarde' }
    });
  }

  // 5. Inesperado: el detalle completo va al log del servidor, nunca al cliente en produccion.
  console.error(err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      ...(isDev && err instanceof Error ? { stack: err.stack } : {})
    }
  });
}
