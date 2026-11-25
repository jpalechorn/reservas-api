import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || password.length < 8
    ) {
      return res.status(400).json({
        error: 'Nombre, correo y contraseña son obligatorios. La contraseña debe tener al menos 8 caracteres.'
      });
    }

    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({
        error: 'El correo electrónico ya está registrado'
      });
    }

    console.error(error);

    return res.status(500).json({
      error: 'Error al registrar el usuario'
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password
    ) {
      return res.status(400).json({
        error: 'Correo y contraseña son obligatorios'
      });
    }

    const result = await authService.loginUser(
      email.trim().toLowerCase(),
      password
    );

    return res.status(200).json(result);

  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    console.error(error);

    return res.status(500).json({
      error: 'Error al iniciar sesión'
    });
  }
}