import { QueryResolvers, UserRole } from '../generated/graphql';
import { requireAuth } from '../../auth/guards';
import { computeSLAInfo, SLAState, Priority } from '../../services/sla/slaEngine';
import { TicketStatus, Prisma } from '@prisma/client';

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
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
    };
  },

  users: async (_parent, args, context) => {
    requireAuth(context);
    const users = await context.prisma.user.findMany({
      where: args.role ? { role: args.role as import('@prisma/client').UserRole } : undefined,
      orderBy: { name: 'asc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as UserRole,
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
    return ticket as unknown as import('../generated/graphql').Ticket;
  },

  tickets: async (_parent, args, context) => {
    requireAuth(context);

    const take = Math.min(Math.max(args.take || 10, 1), 50);
    const whereClause: Prisma.TicketWhereInput = {};

    if (args.status) {
      whereClause.status = args.status as TicketStatus;
    }
    if (args.priority) {
      whereClause.priority = args.priority as import('@prisma/client').Priority;
    }
    if (args.assigneeId) {
      whereClause.assigneeId = args.assigneeId;
    }

    const ticketInclude = {
      reporter: true,
      assignee: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' as const },
      },
    };

    if (args.slaState) {
      const holidays = await context.prisma.holiday.findMany();
      const holidayItems = holidays.map((h) => ({ date: h.date, name: h.name }));

      // Safe upper bound on in-memory SLA scan to prevent server DoS
      const allMatching = await context.prisma.ticket.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 300,
        include: ticketInclude,
      });

      const filtered = allMatching.filter((t) => {
        const sla = computeSLAInfo(
          {
            createdAt: t.createdAt,
            priority: t.priority as Priority,
            firstResponseAt: t.firstResponseAt,
            resolvedAt: t.resolvedAt,
          },
          holidayItems,
        );
        const filterState = args.slaState as unknown as SLAState;
        return sla.firstResponseState === filterState || sla.resolutionState === filterState;
      });

      let startIndex = 0;
      if (args.cursor) {
        const cursorIndex = filtered.findIndex((t) => t.id === args.cursor);
        if (cursorIndex >= 0) {
          startIndex = cursorIndex + 1;
        } else {
          startIndex = filtered.length;
        }
      }

      const paged = filtered.slice(startIndex, startIndex + take);
      const hasNextPage = startIndex + take < filtered.length;
      const endCursor = paged.length > 0 ? (paged[paged.length - 1]?.id ?? null) : null;

      return {
        nodes: paged as unknown as import('../generated/graphql').Ticket[],
        pageInfo: {
          hasNextPage,
          endCursor,
        },
      };
    }

    // Standard cursor pagination with eager-loaded relations
    const findArgs: Prisma.TicketFindManyArgs = {
      where: whereClause,
      take: take + 1,
      orderBy: { createdAt: 'desc' },
      include: ticketInclude,
    };

    if (args.cursor) {
      findArgs.cursor = { id: args.cursor };
      findArgs.skip = 1;
    }

    const items = await context.prisma.ticket.findMany(findArgs);
    const hasNextPage = items.length > take;
    const nodes = hasNextPage ? items.slice(0, take) : items;
    const endCursor = nodes.length > 0 ? (nodes[nodes.length - 1]?.id ?? null) : null;

    return {
      nodes: nodes as unknown as import('../generated/graphql').Ticket[],
      pageInfo: {
        hasNextPage,
        endCursor,
      },
    };
  },

  dashboard: async (_parent, _args, context) => {
    requireAuth(context);

    const [openTickets, inProgressTickets, allTickets, holidays] = await Promise.all([
      context.prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
      context.prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      context.prisma.ticket.findMany({
        where: {
          status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
        },
        select: {
          createdAt: true,
          priority: true,
          firstResponseAt: true,
          resolvedAt: true,
        },
      }),
      context.prisma.holiday.findMany(),
    ]);

    const holidayItems = holidays.map((h) => ({ date: h.date, name: h.name }));

    let atRiskTickets = 0;
    let breachedTickets = 0;

    for (const t of allTickets) {
      const sla = computeSLAInfo(
        {
          createdAt: t.createdAt,
          priority: t.priority as Priority,
          firstResponseAt: t.firstResponseAt,
          resolvedAt: t.resolvedAt,
        },
        holidayItems,
      );

      if (sla.firstResponseState === SLAState.BREACHED || sla.resolutionState === SLAState.BREACHED) {
        breachedTickets++;
      } else if (sla.firstResponseState === SLAState.AT_RISK || sla.resolutionState === SLAState.AT_RISK) {
        atRiskTickets++;
      }
    }

    return {
      openTickets,
      inProgressTickets,
      atRiskTickets,
      breachedTickets,
    };
  },
};
