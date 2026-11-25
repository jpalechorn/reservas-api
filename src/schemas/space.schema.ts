import { z } from 'zod';

// z.coerce.number convierte "30" en 30. Con z.number() a secas, "30" seria rechazado.
// El ownerId NO esta en el esquema: siempre sale del usuario autenticado, nunca del body.
export const createSpaceSchema = z.object({
  name: z.string({ error: 'name es obligatorio' }).trim().min(2, 'name debe tener al menos 2 caracteres'),
  capacity: z.coerce
    .number({ error: 'capacity debe ser un numero' })
    .int('capacity debe ser un entero')
    .positive('capacity debe ser mayor que 0'),
  location: z.string({ error: 'location es obligatorio' }).trim().min(1, 'location es obligatorio'),
  type: z.string({ error: 'type es obligatorio' }).trim().min(1, 'type es obligatorio')
});

// Para editar, todos los campos son opcionales, pero debe venir al menos uno.
export const updateSpaceSchema = createSpaceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Envie al menos un campo para actualizar');

export type CreateSpaceBody = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceBody = z.infer<typeof updateSpaceSchema>;
