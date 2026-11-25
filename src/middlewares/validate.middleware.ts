import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { AppError } from '../errors/app-error';

// Valida body o params con un esquema Zod ANTES de llegar al controlador.
// Si el body es valido, lo reemplaza por la version limpia: convertida y sin campos extra.
// (En Express 5 req.query es de solo lectura: por eso solo se validan body y params.)
export function validate(schema: ZodType, source: 'body' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }));
      return next(new AppError(400, 'Datos de entrada invalidos', 'VALIDATION_ERROR', details));
    }
    if (source === 'body') req.body = result.data;
    next();
  };
}
