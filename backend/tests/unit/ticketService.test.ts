import { describe, it, expect } from 'vitest';
import { TicketStatus, Priority, UserRole } from '@prisma/client';
import {
  validateStatusTransition,
  ALLOWED_TRANSITIONS,
} from '../../src/services/ticket/ticketService';
import { AppGraphQLError } from '../../src/errors/AppError';

describe('Ticket Service & Status Transition Rules', () => {
  describe('Status Transition Validation', () => {
    it('allows same-state transitions (no-op)', () => {
      expect(() => validateStatusTransition(TicketStatus.OPEN, TicketStatus.OPEN)).not.toThrow();
      expect(() =>
        validateStatusTransition(TicketStatus.IN_PROGRESS, TicketStatus.IN_PROGRESS),
      ).not.toThrow();
    });

    it('allows OPEN -> IN_PROGRESS, RESOLVED, CLOSED', () => {
      expect(ALLOWED_TRANSITIONS.OPEN).toContain(TicketStatus.IN_PROGRESS);
      expect(ALLOWED_TRANSITIONS.OPEN).toContain(TicketStatus.RESOLVED);
      expect(ALLOWED_TRANSITIONS.OPEN).toContain(TicketStatus.CLOSED);

      expect(() =>
        validateStatusTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
      ).not.toThrow();
      expect(() =>
        validateStatusTransition(TicketStatus.OPEN, TicketStatus.RESOLVED),
      ).not.toThrow();
      expect(() =>
        validateStatusTransition(TicketStatus.OPEN, TicketStatus.CLOSED),
      ).not.toThrow();
    });

    it('allows IN_PROGRESS -> OPEN, RESOLVED, CLOSED', () => {
      expect(ALLOWED_TRANSITIONS.IN_PROGRESS).toContain(TicketStatus.OPEN);
      expect(ALLOWED_TRANSITIONS.IN_PROGRESS).toContain(TicketStatus.RESOLVED);
      expect(ALLOWED_TRANSITIONS.IN_PROGRESS).toContain(TicketStatus.CLOSED);

      expect(() =>
        validateStatusTransition(TicketStatus.IN_PROGRESS, TicketStatus.OPEN),
      ).not.toThrow();
      expect(() =>
        validateStatusTransition(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED),
      ).not.toThrow();
      expect(() =>
        validateStatusTransition(TicketStatus.IN_PROGRESS, TicketStatus.CLOSED),
      ).not.toThrow();
    });

    it('allows RESOLVED -> IN_PROGRESS (reopening) and CLOSED', () => {
      expect(ALLOWED_TRANSITIONS.RESOLVED).toContain(TicketStatus.IN_PROGRESS);
      expect(ALLOWED_TRANSITIONS.RESOLVED).toContain(TicketStatus.CLOSED);

      expect(() =>
        validateStatusTransition(TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS),
      ).not.toThrow();
      expect(() =>
        validateStatusTransition(TicketStatus.RESOLVED, TicketStatus.CLOSED),
      ).not.toThrow();
    });

    it('prevents RESOLVED -> OPEN', () => {
      try {
        validateStatusTransition(TicketStatus.RESOLVED, TicketStatus.OPEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppGraphQLError);
        expect((err as AppGraphQLError).extensions?.code).toBe('INVALID_STATUS_TRANSITION');
      }
    });

    it('allows CLOSED -> OPEN (explicit reopen)', () => {
      expect(() =>
        validateStatusTransition(TicketStatus.CLOSED, TicketStatus.OPEN),
      ).not.toThrow();
    });

    it('prevents CLOSED -> IN_PROGRESS or CLOSED -> RESOLVED without reopening first', () => {
      try {
        validateStatusTransition(TicketStatus.CLOSED, TicketStatus.IN_PROGRESS);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppGraphQLError);
        expect((err as AppGraphQLError).extensions?.code).toBe('INVALID_STATUS_TRANSITION');
      }

      try {
        validateStatusTransition(TicketStatus.CLOSED, TicketStatus.RESOLVED);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppGraphQLError);
        expect((err as AppGraphQLError).extensions?.code).toBe('INVALID_STATUS_TRANSITION');
      }
    });
  });

  describe('Priority and User Role Enums Validation', () => {
    it('has all required priorities', () => {
      expect(Priority.LOW).toBe('LOW');
      expect(Priority.MEDIUM).toBe('MEDIUM');
      expect(Priority.HIGH).toBe('HIGH');
      expect(Priority.URGENT).toBe('URGENT');
    });

    it('has all required user roles', () => {
      expect(UserRole.REPORTER).toBe('REPORTER');
      expect(UserRole.AGENT).toBe('AGENT');
    });
  });
});
