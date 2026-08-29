import { describe, it, expect } from 'vitest';
import {
  createValidationError,
  createUnauthorizedError,
  createForbiddenError,
  createTicketNotFoundError,
  createUserNotFoundError,
  createInvalidStatusTransitionError,
  createInvalidPriorityError,
  createInvalidCommentError,
} from '../../src/errors/AppError';

describe('AppError & Error Hierarchy Unit Tests', () => {
  it('should create VALIDATION_ERROR with HTTP 400', () => {
    const err = createValidationError('Invalid input');
    expect(err.message).toBe('Invalid input');
    expect(err.extensions.code).toBe('VALIDATION_ERROR');
    expect(err.extensions.http).toEqual({ status: 400 });
  });

  it('should create UNAUTHORIZED with HTTP 401', () => {
    const err = createUnauthorizedError();
    expect(err.message).toBe('Authentication required');
    expect(err.extensions.code).toBe('UNAUTHORIZED');
    expect(err.extensions.http).toEqual({ status: 401 });
  });

  it('should create FORBIDDEN with HTTP 403', () => {
    const err = createForbiddenError();
    expect(err.message).toBe('Access forbidden for your role');
    expect(err.extensions.code).toBe('FORBIDDEN');
    expect(err.extensions.http).toEqual({ status: 403 });
  });

  it('should create TICKET_NOT_FOUND error with correct entity ID', () => {
    const err = createTicketNotFoundError('tkt-123');
    expect(err.message).toContain('tkt-123');
    expect(err.extensions.code).toBe('TICKET_NOT_FOUND');
  });

  it('should create USER_NOT_FOUND error with correct user ID', () => {
    const err = createUserNotFoundError('usr-456');
    expect(err.message).toContain('usr-456');
    expect(err.extensions.code).toBe('USER_NOT_FOUND');
  });

  it('should create INVALID_STATUS_TRANSITION error describing from and to statuses', () => {
    const err = createInvalidStatusTransitionError('RESOLVED', 'OPEN');
    expect(err.message).toContain('RESOLVED');
    expect(err.message).toContain('OPEN');
    expect(err.extensions.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('should create INVALID_PRIORITY error', () => {
    const err = createInvalidPriorityError('CRITICAL');
    expect(err.message).toContain('CRITICAL');
    expect(err.extensions.code).toBe('INVALID_PRIORITY');
  });

  it('should create INVALID_COMMENT error', () => {
    const err = createInvalidCommentError();
    expect(err.message).toBe('Comment content cannot be empty');
    expect(err.extensions.code).toBe('INVALID_COMMENT');
  });
});
