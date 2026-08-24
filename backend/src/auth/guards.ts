import { UserRole, PrismaClient } from '@prisma/client';
import { AuthUser } from './jwt';
import { createUnauthorizedError, createForbiddenError } from '../errors/AppError';

export interface GraphQLContext {
  prisma: PrismaClient;
  currentUser: AuthUser | null;
}

/**
 * Ensures the request is made by an authenticated user.
 * Throws UNAUTHORIZED error if not authenticated.
 */
export function requireAuth(context: GraphQLContext): AuthUser {
  if (!context.currentUser) {
    throw createUnauthorizedError('You must be logged in to perform this action');
  }
  return context.currentUser;
}

/**
 * Ensures the request is made by an AGENT.
 * Throws UNAUTHORIZED if not logged in, or FORBIDDEN if role is not AGENT.
 */
export function requireAgent(context: GraphQLContext): AuthUser {
  const user = requireAuth(context);
  if (user.role !== UserRole.AGENT) {
    throw createForbiddenError('Only support agents can perform this action');
  }
  return user;
}
