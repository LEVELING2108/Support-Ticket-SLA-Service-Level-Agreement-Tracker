import { TicketResolvers, UserRole, SlaState } from '../generated/graphql';
import { computeSLAInfo, Priority } from '../../services/sla/slaEngine';

export const ticketResolvers: TicketResolvers = {
  reporter: async (parent, _args, context) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { reporter?: import('@prisma/client').User; reporterId?: string };
    if (p.reporter) {
      return {
        id: p.reporter.id,
        email: p.reporter.email,
        name: p.reporter.name,
        role: p.reporter.role as UserRole,
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
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
    };
  },

  assignee: async (parent, _args, context) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { assignee?: import('@prisma/client').User | null; assigneeId?: string | null };
    if (p.assignee !== undefined) {
      if (!p.assignee) return null;
      return {
        id: p.assignee.id,
        email: p.assignee.email,
        name: p.assignee.name,
        role: p.assignee.role as UserRole,
        createdAt: p.assignee.createdAt.toISOString(),
      };
    }
    const assigneeId = p.assigneeId;
    if (!assigneeId) {
      return null;
    }
    const user = await context.prisma.user.findUnique({
      where: { id: assigneeId },
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

  comments: async (parent, _args, context) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { comments?: Array<import('@prisma/client').Comment & { author: import('@prisma/client').User }>; id: string };
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
          role: c.author.role as UserRole,
          createdAt: c.author.createdAt.toISOString(),
        },
      }));
    }
    const comments = await context.prisma.comment.findMany({
      where: { ticketId: p.id },
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
        role: c.author.role as UserRole,
        createdAt: c.author.createdAt.toISOString(),
      },
    }));
  },

  sla: async (parent, _args, context) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as {
      createdAt: Date | string;
      priority: import('@prisma/client').Priority;
      firstResponseAt?: Date | string | null;
      resolvedAt?: Date | string | null;
    };

    const holidays = await context.prisma.holiday.findMany();
    const holidayItems = holidays.map((h) => ({ date: h.date, name: h.name }));

    const createdAt = typeof p.createdAt === 'string' ? new Date(p.createdAt) : p.createdAt;
    const firstResponseAt =
      typeof p.firstResponseAt === 'string'
        ? new Date(p.firstResponseAt)
        : p.firstResponseAt ?? null;
    const resolvedAt =
      typeof p.resolvedAt === 'string' ? new Date(p.resolvedAt) : p.resolvedAt ?? null;

    const result = computeSLAInfo(
      {
        createdAt,
        priority: p.priority as Priority,
        firstResponseAt,
        resolvedAt,
      },
      holidayItems,
    );

    return {
      firstResponseDueAt: result.firstResponseDueAt,
      resolutionDueAt: result.resolutionDueAt,
      firstResponseState: result.firstResponseState as unknown as SlaState,
      resolutionState: result.resolutionState as unknown as SlaState,
      firstResponseRemainingMinutes: result.firstResponseRemainingMinutes,
      resolutionRemainingMinutes: result.resolutionRemainingMinutes,
    };
  },
};
