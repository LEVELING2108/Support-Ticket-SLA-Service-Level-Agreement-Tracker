import { QueryResolvers } from '../generated/graphql';
import { requireAuth } from '../../auth/guards';

export const queryResolvers: QueryResolvers = {
  me: async (_parent, _args, context) => {
    if (!context.currentUser) {
      return null;
    }
    const user = await context.prisma.user.findUnique({
      where: { id: context.currentUser.id },
    });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  },

  users: async (_parent, args, context) => {
    requireAuth(context);
    const users = await context.prisma.user.findMany({
      where: args.role ? { role: args.role } : undefined,
      orderBy: { name: 'asc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    }));
  },

  holidays: async (_parent, _args, context) => {
    const holidays = await context.prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    });
    return holidays.map((h) => ({
      id: h.id,
      date: h.date.toISOString().split('T')[0] as string,
      name: h.name,
      createdAt: h.createdAt.toISOString(),
    }));
  },

  ticket: async (_parent, args, context) => {
    requireAuth(context);
    const ticket = await context.prisma.ticket.findUnique({
      where: { id: args.id },
      include: {
        reporter: true,
        assignee: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!ticket) {
      return null;
    }
    // Ticket field resolvers handle SLA and associations
    return ticket as unknown as import('../generated/graphql').Ticket;
  },

  tickets: async () => {
    // Implemented fully in Phase 7
    return {
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    };
  },

  dashboard: async () => {
    // Implemented fully in Phase 7
    return {
      openTickets: 0,
      inProgressTickets: 0,
      atRiskTickets: 0,
      breachedTickets: 0,
    };
  },
};
