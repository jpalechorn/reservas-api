import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Registro de usuarios
router.post('/register', authController.register);

// Inicio de sesión
router.post('/login', authController.login);

export default router;