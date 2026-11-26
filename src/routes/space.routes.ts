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

/**
 * @swagger
 * /api/spaces:
 *   get:
 *     summary: Listar todos los espacios
 *     tags: [Espacios]
 *     responses:
 *       200:
 *         description: Lista de espacios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Space' }
 *   post:
 *     summary: Crear un espacio (OWNER o ADMIN). El espacio queda a nombre de quien lo crea
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SpaceInput' }
 *     responses:
 *       201:
 *         description: Espacio creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Space' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.get('/', spaceController.getAllSpaces);

/**
 * @swagger
 * /api/spaces/mios:
 *   get:
 *     summary: Listar los espacios del usuario autenticado
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Espacios cuyo propietario es el usuario del token
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Space' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// "mios" va antes de "/:id"; si no, Express lo tomaría como un id
router.get('/mios', requireAuth, spaceController.getMySpaces);

/**
 * @swagger
 * /api/spaces/{id}:
 *   get:
 *     summary: Consultar un espacio por id
 *     tags: [Espacios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Espacio encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Space' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Actualizar un espacio (el OWNER solo los suyos, el ADMIN cualquiera)
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SpaceUpdate' }
 *     responses:
 *       200:
 *         description: Espacio actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Space' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *   delete:
 *     summary: Eliminar un espacio (solo ADMIN)
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer, example: 16 }
 *     responses:
 *       204:
 *         description: Espacio eliminado, sin contenido en la respuesta
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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
