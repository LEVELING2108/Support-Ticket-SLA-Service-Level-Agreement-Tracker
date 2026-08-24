export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
        createdAt
      }
    }
  }
`;

export const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $password: String!, $role: UserRole!) {
    register(name: $name, email: $email, password: $password, role: $role) {
      token
      user {
        id
        email
        name
        role
        createdAt
      }
    }
  }
`;

export const GET_ME_QUERY = `
  query GetMe {
    me {
      id
      email
      name
      role
      createdAt
    }
  }
`;

export const GET_USERS_QUERY = `
  query GetUsers($role: UserRole) {
    users(role: $role) {
      id
      email
      name
      role
      createdAt
    }
  }
`;

export const GET_HOLIDAYS_QUERY = `
  query GetHolidays {
    holidays {
      id
      date
      name
      createdAt
    }
  }
`;

export const GET_DASHBOARD_QUERY = `
  query GetDashboard {
    dashboard {
      openTickets
      inProgressTickets
      atRiskTickets
      breachedTickets
    }
  }
`;

export const GET_TICKETS_QUERY = `
  query GetTickets(
    $status: TicketStatus
    $priority: Priority
    $assigneeId: ID
    $slaState: SLAState
    $take: Int
    $cursor: String
  ) {
    tickets(
      status: $status
      priority: $priority
      assigneeId: $assigneeId
      slaState: $slaState
      take: $take
      cursor: $cursor
    ) {
      nodes {
        id
        title
        description
        priority
        status
        createdAt
        firstResponseAt
        resolvedAt
        reporter {
          id
          name
          email
          role
        }
        assignee {
          id
          name
          email
          role
        }
        sla {
          firstResponseDueAt
          resolutionDueAt
          firstResponseState
          resolutionState
          firstResponseRemainingMinutes
          resolutionRemainingMinutes
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_TICKET_QUERY = `
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id
      title
      description
      priority
      status
      createdAt
      firstResponseAt
      resolvedAt
      reporter {
        id
        name
        email
        role
      }
      assignee {
        id
        name
        email
        role
      }
      comments {
        id
        content
        createdAt
        author {
          id
          name
          email
          role
        }
      }
      sla {
        firstResponseDueAt
        resolutionDueAt
        firstResponseState
        resolutionState
        firstResponseRemainingMinutes
        resolutionRemainingMinutes
      }
    }
  }
`;

export const CREATE_TICKET_MUTATION = `
  mutation CreateTicket($title: String!, $description: String!, $priority: Priority!) {
    createTicket(title: $title, description: $description, priority: $priority) {
      id
      title
      priority
      status
    }
  }
`;

export const ASSIGN_TICKET_MUTATION = `
  mutation AssignTicket($ticketId: ID!, $assigneeId: ID!) {
    assignTicket(ticketId: $ticketId, assigneeId: $assigneeId) {
      id
      assignee {
        id
        name
      }
    }
  }
`;

export const CHANGE_STATUS_MUTATION = `
  mutation ChangeTicketStatus($ticketId: ID!, $status: TicketStatus!) {
    changeTicketStatus(ticketId: $ticketId, status: $status) {
      id
      status
      resolvedAt
    }
  }
`;

export const ADD_COMMENT_MUTATION = `
  mutation AddComment($ticketId: ID!, $content: String!) {
    addComment(ticketId: $ticketId, content: $content) {
      id
      content
      createdAt
      author {
        id
        name
        role
      }
    }
  }
`;

export const RESOLVE_TICKET_MUTATION = `
  mutation ResolveTicket($ticketId: ID!) {
    resolveTicket(ticketId: $ticketId) {
      id
      status
      resolvedAt
    }
  }
`;
