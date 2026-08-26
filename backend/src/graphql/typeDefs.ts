export const typeDefs = /* GraphQL */ `
  enum UserRole {
    REPORTER
    AGENT
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum TicketStatus {
    OPEN
    IN_PROGRESS
    RESOLVED
    CLOSED
  }

  enum SLAState {
    ON_TRACK
    AT_RISK
    BREACHED
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    createdAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    ticketId: ID!
    author: User!
    createdAt: String!
  }

  type Holiday {
    id: ID!
    date: String!
    name: String!
    createdAt: String!
  }

  type SLAInfo {
    firstResponseDueAt: String!
    resolutionDueAt: String!
    firstResponseState: SLAState!
    resolutionState: SLAState!
    firstResponseRemainingMinutes: Int!
    resolutionRemainingMinutes: Int!
  }

  type Ticket {
    id: ID!
    title: String!
    description: String!
    priority: Priority!
    status: TicketStatus!
    reporter: User!
    assignee: User
    comments: [Comment!]!
    createdAt: String!
    firstResponseAt: String
    resolvedAt: String
    sla: SLAInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type TicketConnection {
    nodes: [Ticket!]!
    pageInfo: PageInfo!
  }

  type TicketDashboard {
    openTickets: Int!
    inProgressTickets: Int!
    atRiskTickets: Int!
    breachedTickets: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    tickets(
      status: TicketStatus
      priority: Priority
      assigneeId: ID
      slaState: SLAState
      take: Int
      cursor: String
    ): TicketConnection!

    ticket(id: ID!): Ticket
    dashboard: TicketDashboard!
    users(role: UserRole): [User!]!
    holidays: [Holiday!]!
    me: User
  }

  type Mutation {
    createTicket(title: String!, description: String!, priority: Priority!): Ticket!
    assignTicket(ticketId: ID!, assigneeId: ID!): Ticket!
    changeTicketStatus(ticketId: ID!, status: TicketStatus!): Ticket!
    addComment(ticketId: ID!, content: String!): Comment!
    resolveTicket(ticketId: ID!): Ticket!

    register(name: String!, email: String!, password: String!, role: UserRole!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;
