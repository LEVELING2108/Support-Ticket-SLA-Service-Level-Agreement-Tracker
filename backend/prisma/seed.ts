import { PrismaClient, UserRole, Priority, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export async function main() {
  console.info('Starting database seed...');

  // Clean existing records in reverse dependency order
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.holiday.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Seed Users
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

  console.info(`Seeded users: ${agent.email}, ${reporter.email}`);

  // Seed Holidays (e.g., upcoming public holidays)
  const holiday = await prisma.holiday.create({
    data: {
      date: new Date('2026-08-31'),
      name: 'National Innovation Day',
    },
  });

  console.info(`Seeded holiday: ${holiday.name} on ${holiday.date.toISOString().split('T')[0]}`);

  // Seed sample tickets across different priorities
  const urgentTicket = await prisma.ticket.create({
    data: {
      title: 'Payment gateway timeout on checkout',
      description: 'Customers are unable to complete payments via Stripe checkout.',
      priority: Priority.URGENT,
      status: TicketStatus.OPEN,
      reporterId: reporter.id,
    },
  });

  const highTicket = await prisma.ticket.create({
    data: {
      title: 'High CPU utilization on analytics cluster',
      description: 'Analytics microservice memory and CPU spiked above 90%.',
      priority: Priority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      reporterId: reporter.id,
      assigneeId: agent.id,
    },
  });

  const mediumTicket = await prisma.ticket.create({
    data: {
      title: 'Export to CSV formatting issue',
      description: 'Exported CSV files contain misplaced headers when special characters are used.',
      priority: Priority.MEDIUM,
      status: TicketStatus.OPEN,
      reporterId: reporter.id,
    },
  });

  const lowTicket = await prisma.ticket.create({
    data: {
      title: 'Update copyright year in footer',
      description: 'Footer still says 2025 on marketing sub-pages.',
      priority: Priority.LOW,
      status: TicketStatus.OPEN,
      reporterId: reporter.id,
    },
  });

  console.info(`Seeded tickets: URGENT (${urgentTicket.id}), HIGH (${highTicket.id}), MEDIUM (${mediumTicket.id}), LOW (${lowTicket.id})`);
  console.info('Database seed completed successfully!');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Error seeding database:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
