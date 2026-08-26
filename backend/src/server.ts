import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { PrismaClient, UserRole, Priority, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { schema } from './graphql/schema';
import { createContext } from './graphql/context';

dotenv.config();

export const prisma = new PrismaClient();
const port = Number(process.env.PORT) || 4000;

export const yoga = createYoga({
  schema,
  context: ({ request }) => {
    const authHeader = request.headers.get('authorization');
    return createContext(prisma, authHeader);
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  },
  graphqlEndpoint: '/graphql',
  landingPage: true,
});

export const server = createServer(yoga);

async function autoSeedIfEmpty() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.info('Database empty. Auto-seeding initial users, holidays, and tickets...');
      const passwordHash = await bcrypt.hash('password123', 10);

      const agent = await prisma.user.create({
        data: {
          email: 'agent@example.com',
          name: 'Alex Agent',
          password: passwordHash,
          role: UserRole.AGENT,
        },
      });

      const reporter = await prisma.user.create({
        data: {
          email: 'reporter@example.com',
          name: 'Rachel Reporter',
          password: passwordHash,
          role: UserRole.REPORTER,
        },
      });

      await prisma.holiday.create({
        data: {
          date: new Date('2026-08-31'),
          name: 'National Innovation Day',
        },
      });

      await prisma.ticket.create({
        data: {
          title: 'Payment gateway timeout on checkout',
          description: 'Customers are unable to complete payments via Stripe checkout.',
          priority: Priority.URGENT,
          status: TicketStatus.OPEN,
          reporterId: reporter.id,
        },
      });

      await prisma.ticket.create({
        data: {
          title: 'High CPU utilization on analytics cluster',
          description: 'Production analytics workers spiking to 99% CPU during ingest.',
          priority: Priority.HIGH,
          status: TicketStatus.IN_PROGRESS,
          reporterId: reporter.id,
          assigneeId: agent.id,
        },
      });

      await prisma.ticket.create({
        data: {
          title: 'Export to CSV formatting issue',
          description: 'Exported transaction dates missing leading zeros in month column.',
          priority: Priority.MEDIUM,
          status: TicketStatus.OPEN,
          reporterId: reporter.id,
        },
      });

      await prisma.ticket.create({
        data: {
          title: 'Update copyright year in footer',
          description: 'Footer currently says 2025 instead of 2026 on landing pages.',
          priority: Priority.LOW,
          status: TicketStatus.OPEN,
          reporterId: reporter.id,
        },
      });

      console.info('Auto-seed completed successfully!');
    }
  } catch (err) {
    console.warn('Auto-seed warning:', err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, '0.0.0.0', async () => {
    console.info(`GraphQL Yoga server running at http://0.0.0.0:${port}/graphql`);
    await autoSeedIfEmpty();
  });
}
