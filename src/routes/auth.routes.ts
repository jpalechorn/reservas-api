import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un usuario (siempre queda con rol CLIENT)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, minLength: 2, example: "Laura Gomez" }
 *               email: { type: string, format: email, example: "laura.gomez@reservas.com" }
 *               password: { type: string, minLength: 8, example: "Reserva2026*" }
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Usuario registrado correctamente" }
 *                 user: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesion y obtener el token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "owner1@reservas.com" }
 *               password: { type: string, example: "OwnerPrueba123*" }
 *     responses:
 *       200:
 *         description: Token para pegar en Authorize
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *                 user: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Credenciales invalidas (INVALID_CREDENTIALS)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/login', validate(loginSchema), authController.login);

export default router;
