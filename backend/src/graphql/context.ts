import { PrismaClient } from '@prisma/client';
import { AuthUser, verifyToken } from '../auth/jwt';

export interface GraphQLContext {
  prisma: PrismaClient;
  currentUser: AuthUser | null;
}

export function createContext(
  prisma: PrismaClient,
  authHeader?: string | null,
): GraphQLContext {
  let currentUser: AuthUser | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    currentUser = verifyToken(token);
  }

  return {
    prisma,
    currentUser,
  };
}
