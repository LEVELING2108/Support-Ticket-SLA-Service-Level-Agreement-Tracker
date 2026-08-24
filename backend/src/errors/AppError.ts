import { GraphQLError } from 'graphql';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'TICKET_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_STATUS_TRANSITION'
  | 'INVALID_PRIORITY'
  | 'INVALID_COMMENT';

export class AppGraphQLError extends GraphQLError {
  constructor(message: string, code: ErrorCode) {
    super(message, {
      extensions: {
        code,
        http: {
          status: code === 'UNAUTHORIZED' ? 401 : code === 'FORBIDDEN' ? 403 : 400,
        },
      },
    });
  }
}

export function createValidationError(message: string): AppGraphQLError {
  return new AppGraphQLError(message, 'VALIDATION_ERROR');
}

export function createUnauthorizedError(message = 'Authentication required'): AppGraphQLError {
  return new AppGraphQLError(message, 'UNAUTHORIZED');
}

export function createForbiddenError(message = 'Access forbidden for your role'): AppGraphQLError {
  return new AppGraphQLError(message, 'FORBIDDEN');
}

export function createTicketNotFoundError(ticketId: string): AppGraphQLError {
  return new AppGraphQLError(`Ticket with ID '${ticketId}' not found`, 'TICKET_NOT_FOUND');
}

export function createUserNotFoundError(userId: string): AppGraphQLError {
  return new AppGraphQLError(`User with ID '${userId}' not found`, 'USER_NOT_FOUND');
}

export function createInvalidStatusTransitionError(from: string, to: string): AppGraphQLError {
  return new AppGraphQLError(
    `Invalid ticket status transition from '${from}' to '${to}'`,
    'INVALID_STATUS_TRANSITION',
  );
}

export function createInvalidPriorityError(priority: string): AppGraphQLError {
  return new AppGraphQLError(`Invalid priority value: '${priority}'`, 'INVALID_PRIORITY');
}

export function createInvalidCommentError(message = 'Comment content cannot be empty'): AppGraphQLError {
  return new AppGraphQLError(message, 'INVALID_COMMENT');
}
