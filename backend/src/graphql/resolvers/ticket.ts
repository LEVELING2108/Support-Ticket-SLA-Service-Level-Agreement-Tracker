import { TicketResolvers, UserRole, SlaState } from '../generated/graphql';
import { computeSLAInfo, Priority } from '../../services/sla/slaEngine';

function toISOStringSafe(val: Date | string | number | null | undefined): string | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val.toISOString();
  if (typeof val === 'number') return new Date(val).toISOString();
  if (!isNaN(Number(val)) && !val.includes('-') && !val.includes('T')) {
    const numDate = new Date(Number(val));
    return isNaN(numDate.getTime()) ? null : numDate.toISOString();
  }
  const strDate = new Date(val);
  return isNaN(strDate.getTime()) ? null : strDate.toISOString();
}

export const ticketResolvers: TicketResolvers = {
  createdAt: (parent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { createdAt: Date | string | number };
    return toISOStringSafe(p.createdAt) || new Date().toISOString();
  },

  firstResponseAt: (parent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { firstResponseAt?: Date | string | number | null };
    return toISOStringSafe(p.firstResponseAt);
  },

  resolvedAt: (parent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { resolvedAt?: Date | string | number | null };
    return toISOStringSafe(p.resolvedAt);
  },

  reporter: async (parent, _args, context) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as { reporter?: import('@prisma/client').User; reporterId?: string };
    if (p.reporter) {
      return {
        id: p.reporter.id,
        email: p.reporter.email,
        name: p.reporter.name,
        role: p.reporter.role as UserRole,
        createdAt: toISOStringSafe(p.reporter.createdAt) || new Date().toISOString(),
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
      createdAt: toISOStringSafe(user.createdAt) || new Date().toISOString(),
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
        createdAt: toISOStringSafe(p.assignee.createdAt) || new Date().toISOString(),
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
      createdAt: toISOStringSafe(user.createdAt) || new Date().toISOString(),
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
        createdAt: toISOStringSafe(c.createdAt) || new Date().toISOString(),
        author: {
          id: c.author.id,
          email: c.author.email,
          name: c.author.name,
          role: c.author.role as UserRole,
          createdAt: toISOStringSafe(c.author.createdAt) || new Date().toISOString(),
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
      createdAt: toISOStringSafe(c.createdAt) || new Date().toISOString(),
      author: {
        id: c.author.id,
        email: c.author.email,
        name: c.author.name,
        role: c.author.role as UserRole,
        createdAt: toISOStringSafe(c.author.createdAt) || new Date().toISOString(),
      },
    }));
  },

  sla: async (parent, _args, context) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parent as unknown as {
      createdAt: Date | string | number;
      priority: import('@prisma/client').Priority;
      firstResponseAt?: Date | string | number | null;
      resolvedAt?: Date | string | number | null;
    };

    const holidays = await context.prisma.holiday.findMany();
    const holidayItems = holidays.map((h) => ({ date: h.date, name: h.name }));

    const createdAtStr = toISOStringSafe(p.createdAt) || new Date().toISOString();
    const createdAt = new Date(createdAtStr);

    const firstResponseAtStr = toISOStringSafe(p.firstResponseAt);
    const firstResponseAt = firstResponseAtStr ? new Date(firstResponseAtStr) : null;

    const resolvedAtStr = toISOStringSafe(p.resolvedAt);
    const resolvedAt = resolvedAtStr ? new Date(resolvedAtStr) : null;

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
