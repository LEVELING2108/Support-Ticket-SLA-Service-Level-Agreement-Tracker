import { MutationResolvers } from '../generated/graphql';
import { AuthService } from '../../services/auth/authService';

export const mutationResolvers: MutationResolvers = {
  register: async (_parent, args, context) => {
    return AuthService.register(
      {
        name: args.name,
        email: args.email,
        password: args.password,
        role: args.role,
      },
      context.prisma,
    );
  },

  login: async (_parent, args, context) => {
    return AuthService.login(
      {
        email: args.email,
        password: args.password,
      },
      context.prisma,
    );
  },

  createTicket: async () => {
    // Implemented in Phase 6
    throw new Error('Not implemented yet');
  },

  assignTicket: async () => {
    // Implemented in Phase 6
    throw new Error('Not implemented yet');
  },

  changeTicketStatus: async () => {
    // Implemented in Phase 6
    throw new Error('Not implemented yet');
  },

  addComment: async () => {
    // Implemented in Phase 6
    throw new Error('Not implemented yet');
  },

  resolveTicket: async () => {
    // Implemented in Phase 6
    throw new Error('Not implemented yet');
  },
};
