import { PrismaClient, TicketStatus, Priority, UserRole, Ticket, Comment } from '@prisma/client';
import { AuthUser } from '../../auth/jwt';
import {
  createValidationError,
  createTicketNotFoundError,
  createUserNotFoundError,
  createInvalidStatusTransitionError,
  createInvalidPriorityError,
  createInvalidCommentError,
} from '../../errors/AppError';

export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.CLOSED],
  [TicketStatus.RESOLVED]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN],
};

export function validateStatusTransition(currentStatus: TicketStatus, targetStatus: TicketStatus): void {
  if (currentStatus === targetStatus) {
    return;
  }
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw createInvalidStatusTransitionError(currentStatus, targetStatus);
  }
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: Priority;
}

export interface AddCommentInput {
  ticketId: string;
  content: string;
}

export class TicketService {
  static async createTicket(
    input: CreateTicketInput,
    user: AuthUser,
    prisma: PrismaClient,
  ): Promise<Ticket> {
    const trimmedTitle = input.title?.trim();
    const trimmedDesc = input.description?.trim();

    if (!trimmedTitle || trimmedTitle.length < 3) {
      throw createValidationError('Ticket title must be at least 3 characters long');
    }

    if (!trimmedDesc || trimmedDesc.length < 5) {
      throw createValidationError('Ticket description must be at least 5 characters long');
    }

    if (!input.priority || !Object.values(Priority).includes(input.priority)) {
      throw createInvalidPriorityError(String(input.priority));
    }

    return prisma.ticket.create({
      data: {
        title: trimmedTitle,
        description: trimmedDesc,
        priority: input.priority,
        status: TicketStatus.OPEN,
        reporterId: user.id,
      },
    });
  }

  static async assignTicket(
    ticketId: string,
    assigneeId: string,
    prisma: PrismaClient,
  ): Promise<Ticket> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw createTicketNotFoundError(ticketId);
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!assignee) {
      throw createUserNotFoundError(assigneeId);
    }

    if (assignee.role !== UserRole.AGENT) {
      throw createValidationError('Tickets can only be assigned to users with the AGENT role');
    }

    return prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assigneeId: assignee.id,
      },
    });
  }

  static async changeTicketStatus(
    ticketId: string,
    targetStatus: TicketStatus,
    prisma: PrismaClient,
  ): Promise<Ticket> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw createTicketNotFoundError(ticketId);
    }

    if (!targetStatus || !Object.values(TicketStatus).includes(targetStatus)) {
      throw createValidationError(`Invalid ticket status: '${targetStatus}'`);
    }

    validateStatusTransition(ticket.status, targetStatus);

    const updateData: {
      status: TicketStatus;
      resolvedAt?: Date;
    } = {
      status: targetStatus,
    };

    if (targetStatus === TicketStatus.RESOLVED && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    return prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });
  }

  static async resolveTicket(ticketId: string, prisma: PrismaClient): Promise<Ticket> {
    return this.changeTicketStatus(ticketId, TicketStatus.RESOLVED, prisma);
  }

  static async addComment(
    input: AddCommentInput,
    user: AuthUser,
    prisma: PrismaClient,
  ): Promise<Comment> {
    const trimmedContent = input.content?.trim();
    if (!trimmedContent) {
      throw createInvalidCommentError('Comment content cannot be empty');
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: input.ticketId },
    });

    if (!ticket) {
      throw createTicketNotFoundError(input.ticketId);
    }

    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        ticketId: input.ticketId,
        authorId: user.id,
      },
    });

    // Check First Response SLA milestone:
    // First comment created by someone other than the ticket reporter triggers and freezes firstResponseAt
    if (user.id !== ticket.reporterId && ticket.firstResponseAt === null) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          firstResponseAt: comment.createdAt,
        },
      });
    }

    return comment;
  }
}
