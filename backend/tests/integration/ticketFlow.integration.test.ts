import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, UserRole, Priority, TicketStatus } from '@prisma/client';
import dotenv from 'dotenv';
import { AuthService } from '../../src/services/auth/authService';
import { TicketService } from '../../src/services/ticket/ticketService';
import { computeSLAInfo, SLAState } from '../../src/services/sla/slaEngine';
import { AppGraphQLError } from '../../src/errors/AppError';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const prisma = new PrismaClient();

describe('Real PostgreSQL Integration Flow', () => {
  let agentId: string;
  let reporterId: string;
  let ticketId: string;

  beforeAll(async () => {
    // Ensure clean state for test run
    await prisma.comment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();
    await prisma.holiday.deleteMany();

    // Create test holiday
    await prisma.holiday.create({
      data: {
        date: new Date('2026-12-25'),
        name: 'Christmas Day',
      },
    });
  });

  afterAll(async () => {
    // Re-seed standard development data after test suite finishes
    const { main: seedDatabase } = await import('../../prisma/seed');
    await seedDatabase();
    await prisma.$disconnect();
  });

  it('Step 1: Registers agent and reporter with password hashing and JWT issuance', async () => {
    const agentAuth = await AuthService.register(
      {
        name: 'Agent Cooper',
        email: 'cooper@support.com',
        password: 'password123',
        role: UserRole.AGENT,
      },
      prisma,
    );

    expect(agentAuth.token).toBeDefined();
    expect(agentAuth.user.role).toBe(UserRole.AGENT);
    agentId = agentAuth.user.id;

    const reporterAuth = await AuthService.register(
      {
        name: 'Reporter Jane',
        email: 'jane@client.com',
        password: 'password123',
        role: UserRole.REPORTER,
      },
      prisma,
    );

    expect(reporterAuth.token).toBeDefined();
    expect(reporterAuth.user.role).toBe(UserRole.REPORTER);
    reporterId = reporterAuth.user.id;
  });

  it('Step 2: Creates an URGENT ticket as reporter and validates default values', async () => {
    const reporterUser = {
      id: reporterId,
      email: 'jane@client.com',
      name: 'Reporter Jane',
      role: UserRole.REPORTER,
    };

    const ticket = await TicketService.createTicket(
      {
        title: 'Critical checkout payment failure',
        description: 'Orders are failing with 500 error on Stripe payment confirmation.',
        priority: Priority.URGENT,
      },
      reporterUser,
      prisma,
    );

    expect(ticket.id).toBeDefined();
    expect(ticket.status).toBe(TicketStatus.OPEN);
    expect(ticket.priority).toBe(Priority.URGENT);
    expect(ticket.reporterId).toBe(reporterId);
    expect(ticket.firstResponseAt).toBeNull();
    expect(ticket.resolvedAt).toBeNull();
    ticketId = ticket.id;
  });

  it('Step 3: Reporter comments on ticket -> firstResponseAt remains NULL', async () => {
    const reporterUser = {
      id: reporterId,
      email: 'jane@client.com',
      name: 'Reporter Jane',
      role: UserRole.REPORTER,
    };

    const comment = await TicketService.addComment(
      {
        ticketId,
        content: 'Adding extra screenshot of the error payload.',
      },
      reporterUser,
      prisma,
    );

    expect(comment.id).toBeDefined();
    expect(comment.authorId).toBe(reporterId);

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    expect(updatedTicket?.firstResponseAt).toBeNull();
  });

  it('Step 4: Agent comments on ticket -> firstResponseAt IS triggered and persisted', async () => {
    const agentUser = {
      id: agentId,
      email: 'cooper@support.com',
      name: 'Agent Cooper',
      role: UserRole.AGENT,
    };

    const comment = await TicketService.addComment(
      {
        ticketId,
        content: 'Investigating payment logs now. Will update within 15 minutes.',
      },
      agentUser,
      prisma,
    );

    expect(comment.id).toBeDefined();
    expect(comment.authorId).toBe(agentId);

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    expect(updatedTicket?.firstResponseAt).not.toBeNull();
    expect(updatedTicket?.firstResponseAt?.getTime()).toBe(comment.createdAt.getTime());
  });

  it('Step 5: Subsequent agent comments do NOT overwrite the original firstResponseAt', async () => {
    const agentUser = {
      id: agentId,
      email: 'cooper@support.com',
      name: 'Agent Cooper',
      role: UserRole.AGENT,
    };

    const originalTicket = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticketId },
    });
    const originalFirstResponse = originalTicket.firstResponseAt?.getTime();

    await TicketService.addComment(
      {
        ticketId,
        content: 'Found the issue in Redis cache lock.',
      },
      agentUser,
      prisma,
    );

    const checkTicket = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticketId },
    });
    expect(checkTicket.firstResponseAt?.getTime()).toBe(originalFirstResponse);
  });

  it('Step 6: Assigns ticket to agent and transitions status to IN_PROGRESS', async () => {
    const assignedTicket = await TicketService.assignTicket(ticketId, agentId, prisma);
    expect(assignedTicket.assigneeId).toBe(agentId);

    const inProgressTicket = await TicketService.changeTicketStatus(
      ticketId,
      TicketStatus.IN_PROGRESS,
      prisma,
    );
    expect(inProgressTicket.status).toBe(TicketStatus.IN_PROGRESS);
  });

  it('Step 7: Resolves ticket and verifies resolvedAt and SLA clock freezing', async () => {
    const resolvedTicket = await TicketService.resolveTicket(ticketId, prisma);
    expect(resolvedTicket.status).toBe(TicketStatus.RESOLVED);
    expect(resolvedTicket.resolvedAt).not.toBeNull();

    const holidays = await prisma.holiday.findMany();
    const slaInfo = computeSLAInfo(
      {
        createdAt: resolvedTicket.createdAt,
        priority: resolvedTicket.priority as unknown as import('../../src/services/sla/slaEngine').Priority,
        firstResponseAt: resolvedTicket.firstResponseAt,
        resolvedAt: resolvedTicket.resolvedAt,
      },
      holidays.map((h) => ({ date: h.date, name: h.name })),
    );

    expect(slaInfo.resolutionState).toBe(SLAState.ON_TRACK);
    expect(slaInfo.resolutionRemainingMinutes).toBe(0);
  });

  it('Step 8: Rejects invalid status transition from RESOLVED to OPEN with AppGraphQLError', async () => {
    try {
      await TicketService.changeTicketStatus(ticketId, TicketStatus.OPEN, prisma);
      expect.unreachable('Should have thrown invalid status transition');
    } catch (err) {
      expect(err).toBeInstanceOf(AppGraphQLError);
      expect((err as AppGraphQLError).extensions?.code).toBe('INVALID_STATUS_TRANSITION');
    }
  });
});
