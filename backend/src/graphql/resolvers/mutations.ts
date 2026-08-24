import { MutationResolvers } from '../generated/graphql';
import { AuthService } from '../../services/auth/authService';
import { TicketService } from '../../services/ticket/ticketService';
import { requireAuth, requireAgent } from '../../auth/guards';
import { Priority, TicketStatus } from '@prisma/client';

export const mutationResolvers: MutationResolvers = {
  register: async (_parent, args, context) => {
    return AuthService.register(
      {
        name: args.name,
        email: args.email,
        password: args.password,
        role: args.role,
      },
      context.prisma,
    );
  },

  login: async (_parent, args, context) => {
    return AuthService.login(
      {
        email: args.email,
        password: args.password,
      },
      context.prisma,
    );
  },

  createTicket: async (_parent, args, context) => {
    const user = requireAuth(context);
    const ticket = await TicketService.createTicket(
      {
        title: args.title,
        description: args.description,
        priority: args.priority as Priority,
      },
      user,
      context.prisma,
    );
    return ticket as unknown as import('../generated/graphql').Ticket;
  },

  assignTicket: async (_parent, args, context) => {
    requireAgent(context);
    const ticket = await TicketService.assignTicket(
      args.ticketId,
      args.assigneeId,
      context.prisma,
    );
    return ticket as unknown as import('../generated/graphql').Ticket;
  },

  changeTicketStatus: async (_parent, args, context) => {
    requireAgent(context);
    const ticket = await TicketService.changeTicketStatus(
      args.ticketId,
      args.status as TicketStatus,
      context.prisma,
    );
    return ticket as unknown as import('../generated/graphql').Ticket;
  },

  addComment: async (_parent, args, context) => {
    const user = requireAuth(context);
    const comment = await TicketService.addComment(
      {
        ticketId: args.ticketId,
        content: args.content,
      },
      user,
      context.prisma,
    );

    const author = await context.prisma.user.findUniqueOrThrow({
      where: { id: comment.authorId },
    });

    return {
      id: comment.id,
      content: comment.content,
      ticketId: comment.ticketId,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: author.id,
        email: author.email,
        name: author.name,
        role: author.role,
        createdAt: author.createdAt.toISOString(),
      },
    };
  },

  resolveTicket: async (_parent, args, context) => {
    requireAgent(context);
    const ticket = await TicketService.resolveTicket(args.ticketId, context.prisma);
    return ticket as unknown as import('../generated/graphql').Ticket;
  },
};
