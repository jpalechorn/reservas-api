import { Router } from 'express';
import * as spaceController from '../controllers/space.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParamSchema } from '../schemas/common.schema';
import { createSpaceSchema, updateSpaceSchema } from '../schemas/space.schema';
import { Role } from '@prisma/client';

const router = Router();
const id = validate(idParamSchema, 'params');

// Orden de cada ruta: ¿quién eres? -> ¿qué puedes hacer? -> ¿los datos son válidos? -> controlador.

// Consultas públicas
router.get('/', spaceController.getAllSpaces);

// Consultar espacios del usuario autenticado ("mios" va antes de "/:id")
router.get('/mios', requireAuth, spaceController.getMySpaces);

router.get('/:id', id, spaceController.getSpaceById);

// Crear espacios: requiere autenticación y rol OWNER o ADMIN
router.post(
  '/',
  requireAuth,
  requireRole(Role.OWNER, Role.ADMIN),
  validate(createSpaceSchema),
  spaceController.createSpace
);

// Actualizar espacios: requiere autenticación y rol OWNER o ADMIN.
// El OWNER solo puede actualizar sus propios espacios (lo revisa el Service).
router.put(
  '/:id',
  requireAuth,
  requireRole(Role.OWNER, Role.ADMIN),
  id,
  validate(updateSpaceSchema),
  spaceController.updateSpace
);

// Eliminar espacios: requiere autenticación y rol ADMIN
router.delete('/:id', requireAuth, requireRole(Role.ADMIN), id, spaceController.deleteSpace);

export default router;
