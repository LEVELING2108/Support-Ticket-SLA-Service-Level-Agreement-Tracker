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
  graphqlEndpoint: '/graphql',
  landingPage: true,
});

export const server = createServer(yoga);

if (require.main === module || process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.info(`GraphQL Yoga server running at http://localhost:${port}/graphql`);
  });
}
