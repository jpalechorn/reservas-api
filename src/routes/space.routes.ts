import { Router } from 'express';
import * as spaceController from '../controllers/space.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Consultas públicas
router.get('/', spaceController.getAllSpaces);

// Consultar espacios del usuario autenticado
router.get('/mios', requireAuth, spaceController.getMySpaces);

router.get('/:id', spaceController.getSpaceById);

// Crear espacios: requiere autenticación y rol OWNER o ADMIN
router.post(
  '/',
  requireAuth,
  requireRole(Role.OWNER, Role.ADMIN),
  spaceController.createSpace
);

// Actualizar espacios: requiere autenticación y rol OWNER o ADMIN.
// El OWNER solo puede actualizar sus propios espacios.
router.put(
  '/:id',
  requireAuth,
  requireRole(Role.OWNER, Role.ADMIN),
  spaceController.updateSpace
);

// Eliminar espacios: requiere autenticación y rol ADMIN
router.delete(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  spaceController.deleteSpace
);

export default router;