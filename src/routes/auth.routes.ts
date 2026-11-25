import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();

// Registro de usuarios
router.post('/register', validate(registerSchema), authController.register);

// Inicio de sesión
router.post('/login', validate(loginSchema), authController.login);

export default router;
