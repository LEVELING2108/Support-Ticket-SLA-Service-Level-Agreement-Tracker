import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers';

const typeDefs = loadFilesSync(path.join(__dirname, 'schema', '**', '*.graphql'));

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
