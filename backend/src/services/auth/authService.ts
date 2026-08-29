import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../auth/password';
import { signToken, AuthUser } from '../../auth/jwt';
import { createValidationError } from '../../errors/AppError';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: string;
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  static async register(input: RegisterInput, prisma: PrismaClient): Promise<AuthPayload> {
    const trimmedName = input.name?.trim();
    const trimmedEmail = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      throw createValidationError('Name must be between 2 and 100 characters long');
    }

    if (!trimmedEmail || trimmedEmail.length > 255 || !EMAIL_REGEX.test(trimmedEmail)) {
      throw createValidationError('Please provide a valid email address (max 255 characters)');
    }

    if (!password || password.trim().length < 6) {
      throw createValidationError('Password must be at least 6 characters long (excluding whitespace)');
    }

    if (password.length > 72) {
      throw createValidationError('Password cannot exceed 72 characters');
    }

    if (!input.role || !Object.values(UserRole).includes(input.role)) {
      throw createValidationError(`Invalid role. Allowed roles: ${Object.values(UserRole).join(', ')}`);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      throw createValidationError('A user with this email address already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        role: input.role,
      },
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(authUser);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  static async login(input: LoginInput, prisma: PrismaClient): Promise<AuthPayload> {
    const trimmedEmail = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!trimmedEmail || !password) {
      throw createValidationError('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      throw createValidationError('Invalid email or password');
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      throw createValidationError('Invalid email or password');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(authUser);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }
}
