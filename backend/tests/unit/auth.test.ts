import { describe, it, expect } from 'vitest';
import { UserRole } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../src/auth/password';
import { signToken, verifyToken, AuthUser } from '../../src/auth/jwt';
import { requireAuth, requireAgent, GraphQLContext } from '../../src/auth/guards';
import { AppGraphQLError } from '../../src/errors/AppError';

describe('Authentication & Authorization Utilities', () => {
  describe('Password Hashing', () => {
    it('hashes passwords securely and verifies correctly', async () => {
      const plain = 'secretPassword123';
      const hash = await hashPassword(plain);

      expect(hash).not.toBe(plain);
      expect(hash.length).toBeGreaterThan(20);

      const isValid = await verifyPassword(plain, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Operations', () => {
    const user: AuthUser = {
      id: 'usr-12345',
      email: 'agent@test.com',
      name: 'Agent Smith',
      role: UserRole.AGENT,
    };

    it('signs and verifies valid JWT token', () => {
      const token = signToken(user);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(user.id);
      expect(decoded?.email).toBe(user.email);
      expect(decoded?.name).toBe(user.name);
      expect(decoded?.role).toBe(user.role);
    });

    it('returns null for tampered or invalid token', () => {
      const invalid = verifyToken('invalid.jwt.token');
      expect(invalid).toBeNull();
    });
  });

  describe('Authorization Guards', () => {
    const fakePrisma = {} as unknown as PrismaClient;

    it('requireAuth returns user when user is logged in', () => {
      const user: AuthUser = {
        id: 'usr-reporter',
        email: 'reporter@test.com',
        name: 'Reporter',
        role: UserRole.REPORTER,
      };

      const context: GraphQLContext = {
        prisma: fakePrisma,
        currentUser: user,
      };

      const result = requireAuth(context);
      expect(result).toEqual(user);
    });

    it('requireAuth throws UNAUTHORIZED when no user is logged in', () => {
      const context: GraphQLContext = {
        prisma: fakePrisma,
        currentUser: null,
      };

      try {
        requireAuth(context);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppGraphQLError);
        expect((err as AppGraphQLError).extensions?.code).toBe('UNAUTHORIZED');
      }
    });

    it('requireAgent allows AGENT user', () => {
      const agent: AuthUser = {
        id: 'usr-agent',
        email: 'agent@test.com',
        name: 'Agent',
        role: UserRole.AGENT,
      };

      const context: GraphQLContext = {
        prisma: fakePrisma,
        currentUser: agent,
      };

      const result = requireAgent(context);
      expect(result.role).toBe(UserRole.AGENT);
    });

    it('requireAgent throws FORBIDDEN for REPORTER user', () => {
      const reporter: AuthUser = {
        id: 'usr-reporter',
        email: 'reporter@test.com',
        name: 'Reporter',
        role: UserRole.REPORTER,
      };

      const context: GraphQLContext = {
        prisma: fakePrisma,
        currentUser: reporter,
      };

      try {
        requireAgent(context);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppGraphQLError);
        expect((err as AppGraphQLError).extensions?.code).toBe('FORBIDDEN');
      }
    });
  });
});
