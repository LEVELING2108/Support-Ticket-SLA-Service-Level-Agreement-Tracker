import { Resolvers } from '../generated/graphql';
import { queryResolvers } from './queries';
import { mutationResolvers } from './mutations';
import { ticketResolvers } from './ticket';

export const resolvers: Resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Ticket: ticketResolvers,
};
