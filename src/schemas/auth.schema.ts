import { z } from 'zod';

// Lo que no esta en el esquema se descarta: si alguien manda "role": "ADMIN", Zod lo borra.
export const registerSchema = z.object({
  name: z.string({ error: 'name es obligatorio' }).trim().min(2, 'name debe tener al menos 2 caracteres'),
  email: z.string({ error: 'email es obligatorio' }).trim().toLowerCase().pipe(z.email('email no es valido')),
  password: z.string({ error: 'password es obligatorio' }).min(8, 'password debe tener al menos 8 caracteres')
});

export const loginSchema = z.object({
  email: z.string({ error: 'email es obligatorio' }).trim().toLowerCase().pipe(z.email('email no es valido')),
  password: z.string({ error: 'password es obligatorio' }).min(1, 'password es obligatorio')
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
