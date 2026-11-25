import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('EMAIL_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: Role.CLIENT
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET_MISSING');
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn']
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}