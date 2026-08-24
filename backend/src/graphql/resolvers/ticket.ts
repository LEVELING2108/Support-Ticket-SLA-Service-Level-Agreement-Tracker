import { TicketResolvers } from '../generated/graphql';
import { computeSLAInfo, Priority } from '../../services/sla/slaEngine';

export const ticketResolvers: TicketResolvers = {
  reporter: async (parent, _args, context) => {
    // If reporter is already loaded on parent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { reporter?: import('@prisma/client').User; reporterId?: string };
    if (p.reporter) {
      return {
        id: p.reporter.id,
        email: p.reporter.email,
        name: p.reporter.name,
        role: p.reporter.role,
        createdAt: p.reporter.createdAt.toISOString(),
      };
    }
    const reporterId = p.reporterId;
    if (!reporterId) {
      throw new Error('Reporter ID missing on ticket');
    }
    const user = await context.prisma.user.findUniqueOrThrow({
      where: { id: reporterId },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  },

  assignee: async (parent, _args, context) => {
    const p = parent as unknown as { assignee?: import('@prisma/client').User | null; assigneeId?: string | null };
    if (p.assignee !== undefined) {
      if (!p.assignee) return null;
      return {
        id: p.assignee.id,
        email: p.assignee.email,
        name: p.assignee.name,
        role: p.assignee.role,
        createdAt: p.assignee.createdAt.toISOString(),
      };
    }
    if (!p.assigneeId) {
      return null;
    }
    const user = await context.prisma.user.findUnique({
      where: { id: p.assigneeId },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  },

  comments: async (parent, _args, context) => {
    const p = parent as unknown as { comments?: Array<import('@prisma/client').Comment & { author: import('@prisma/client').User }> };
    if (p.comments) {
      return p.comments.map((c) => ({
        id: c.id,
        content: c.content,
        ticketId: c.ticketId,
        createdAt: c.createdAt.toISOString(),
        author: {
          id: c.author.id,
          email: c.author.email,
          name: c.author.name,
          role: c.author.role,
          createdAt: c.author.createdAt.toISOString(),
        },
      }));
    }
    const comments = await context.prisma.comment.findMany({
      where: { ticketId: parent.id },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      ticketId: c.ticketId,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        email: c.author.email,
        name: c.author.name,
        role: c.author.role,
        createdAt: c.author.createdAt.toISOString(),
      },
    }));
  },

  createdAt: (parent) => {
    const p = parent as unknown as { createdAt: Date | string };
    return typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString();
  },

  firstResponseAt: (parent) => {
    const p = parent as unknown as { firstResponseAt?: Date | string | null };
    if (!p.firstResponseAt) return null;
    return typeof p.firstResponseAt === 'string' ? p.firstResponseAt : p.firstResponseAt.toISOString();
  },

  resolvedAt: (parent) => {
    const p = parent as unknown as { resolvedAt?: Date | string | null };
    if (!p.resolvedAt) return null;
    return typeof p.resolvedAt === 'string' ? p.resolvedAt : p.resolvedAt.toISOString();
  },

  sla: async (parent, _args, context) => {
    const p = parent as unknown as {
      createdAt: Date | string;
      priority: Priority;
      firstResponseAt?: Date | string | null;
      resolvedAt?: Date | string | null;
    };

    const holidays = await context.prisma.holiday.findMany();

    const createdAtDate = typeof p.createdAt === 'string' ? new Date(p.createdAt) : p.createdAt;
    const firstResponseAtDate = p.firstResponseAt
      ? typeof p.firstResponseAt === 'string'
        ? new Date(p.firstResponseAt)
        : p.firstResponseAt
      : null;
    const resolvedAtDate = p.resolvedAt
      ? typeof p.resolvedAt === 'string'
        ? new Date(p.resolvedAt)
        : p.resolvedAt
      : null;

    return computeSLAInfo(
      {
        createdAt: createdAtDate,
        priority: p.priority,
        firstResponseAt: firstResponseAtDate,
        resolvedAt: resolvedAtDate,
      },
      holidays.map((h) => ({ date: h.date, name: h.name })),
    );
  },
};
