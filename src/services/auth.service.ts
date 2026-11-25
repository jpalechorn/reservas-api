import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { LoginBody, RegisterBody } from '../schemas/auth.schema';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  // Error comun (no AppError): es un fallo de configuracion del servidor y responde 500.
  if (!secret) throw new Error('JWT_SECRET no esta configurado');
  return secret;
}

// Registro publico: SIEMPRE crea un CLIENT. El rol nunca se toma del body.
export async function registerUser(data: RegisterBody) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw new AppError(409, 'El correo electronico ya esta registrado', 'EMAIL_TAKEN');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: Role.CLIENT
    },
    select: { id: true, name: true, email: true, role: true }
  });
}

// Mismo error si el correo no existe o si la contrasena esta mal: no revelamos cual de los dos fallo.
export async function loginUser({ email, password }: LoginBody) {
  const user = await prisma.user.findUnique({ where: { email } });
  const validPassword = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !validPassword) {
    throw new AppError(401, 'Credenciales incorrectas', 'INVALID_CREDENTIALS');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, getSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn']
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
}
