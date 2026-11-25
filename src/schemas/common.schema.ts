import { z } from 'zod';

// /api/spaces/abc o /api/spaces/-1 no llegan a la base de datos.
export const idParamSchema = z.object({
  id: z.coerce
    .number({ error: 'id debe ser un numero' })
    .int('id debe ser un entero')
    .positive('id debe ser mayor que 0')
});
