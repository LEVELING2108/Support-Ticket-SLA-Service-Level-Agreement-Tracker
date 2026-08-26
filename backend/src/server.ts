import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { PrismaClient } from '@prisma/client';
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

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, '0.0.0.0', () => {
    console.info(`GraphQL Yoga server running at http://0.0.0.0:${port}/graphql`);
  });
}
