# 🎫 Support Ticket & SLA (Service Level Agreement) Tracker

A full-stack, enterprise-grade Support Ticket and SLA Tracker built with **Node.js / Bun**, **TypeScript** (strict mode, `no-explicit-any`), **GraphQL Yoga** (schema-first), **PostgreSQL**, **Prisma ORM**, and **React** with **Tailwind CSS**.

---

## 📌 Table of Contents
1. [Overview & Core Value](#-overview--core-value)
2. [Tech Stack](#-tech-stack)
3. [System Architecture](#-system-architecture)
4. [Database Schema](#-database-schema)
5. [SLA Engine & Business Hours Calculation](#-sla-engine--business-hours-calculation)
6. [Ticket Status Transition Rules](#-ticket-status-transition-rules)
7. [Authentication & Authorization](#-authentication--authorization)
8. [Environment Variables](#-environment-variables)
9. [Getting Started & Local Setup](#-getting-started--local-setup)
10. [Database Migrations & Seeding](#-database-migrations--seeding)
11. [Running the Application](#-running-the-application)
12. [Testing Strategy (Unit & Integration)](#-testing-strategy-unit--integration)
13. [Example GraphQL Operations](#-example-graphql-operations)
14. [How I'd Extend This](#-how-id-extend-this)

---

## 🎯 Overview & Core Value

In real-world customer support, SLAs (Service Level Agreements) dictate how quickly support agents must respond to and resolve customer inquiries. Crucially, **SLA clocks measure business hours, not wall-clock time**. Nights, weekends, and configured public holidays never count against the SLA budget.

This application provides:
- **Server-Side SLA Engine**: Deterministic calculation of first-response and resolution deadlines, real-time SLA states (`ON_TRACK`, `AT_RISK`, `BREACHED`), and remaining business minutes.
- **Clock Freezing**: When an SLA milestone occurs (`firstResponseAt` or `resolvedAt`), the respective clock freezes permanently and can never retroactively breach.
- **First Response Tracking**: The first comment created by any user *other than the ticket reporter* triggers and freezes the first-response SLA.
- **Schema-First GraphQL API**: Strictly typed `.graphql` SDL contract with generated TypeScript resolver signatures.
- **Role-Based Access Control**: Granular `REPORTER` vs `AGENT` permissions enforced strictly on the server.
- **Interactive UI**: Real-time status badges, countdown indicators, filtering, pagination, and dashboard metrics.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Runtime & Language** | [Bun](https://bun.sh/) / [Node.js](https://nodejs.org/) (v20+), [TypeScript](https://www.typescriptlang.org/) (Strict mode, `no-explicit-any: error`) |
| **API Framework** | [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server), `@graphql-codegen` (Schema-First) |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/), Docker Compose |
| **Authentication** | JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Date & Timezone** | `date-fns`, `date-fns-tz` |
| **Frontend** | [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Urql](https://formidable.com/open-source/urql/), Lucide Icons |
| **Testing** | [Vitest](https://vitest.dev/) (Unit & Integration tests against real PostgreSQL) |

---

## 🏗 System Architecture

```mermaid
flowchart TB
    subgraph Client ["Frontend (React 18 + Vite + Tailwind)"]
        UI[Dashboard / Ticket List / Detail View]
        GraphQLClient[Urql GraphQL Client]
        UI --> GraphQLClient
    end

    subgraph Backend ["Backend (GraphQL Yoga Server)"]
        AuthMiddleware[Auth & JWT Context Guard]
        Resolvers[GraphQL Resolvers (Schema-First)]
        TicketService[Ticket & Comment Service]
        SLAEngine[SLA & Business Hours Engine (Pure & Isolated)]
        
        GraphQLClient -->|HTTP / GraphQL| AuthMiddleware
        AuthMiddleware --> Resolvers
        Resolvers --> TicketService
        TicketService --> SLAEngine
    end

    subgraph DataStore ["Persistence Layer"]
        Prisma[Prisma Client ORM]
        Postgres[(PostgreSQL 16 Database)]
        
        TicketService --> Prisma
        Prisma --> Postgres
    end
```

### Architecture Highlights:
1. **Isolated SLA Engine**: The SLA calculation logic is 100% decoupled from Prisma, HTTP, and GraphQL. It is a pure, deterministic mathematical engine accepting timestamps, holiday lists, and SLA policies.
2. **Backend-Driven SLA Truth**: The frontend never calculates SLA state or percentages. The API is the single source of truth for all SLA milestones, remaining business minutes, and states.
3. **Strict Type Safety**: GraphQL schema `.graphql` files automatically generate TypeScript types via `graphql-codegen`, preventing `any` from leaking across layers.

---

## 🗄 Database Schema

The database is managed with Prisma ORM and PostgreSQL.

```mermaid
erDiagram
    User ||--o{ Ticket : "reports (reporterId)"
    User ||--o{ Ticket : "assigned (assigneeId)"
    User ||--o{ Comment : "authors (authorId)"
    Ticket ||--o{ Comment : "contains (ticketId)"

    User {
        String id PK
        String email UK
        String password
        String name
        UserRole role "REPORTER | AGENT"
        DateTime createdAt
        DateTime updatedAt
    }

    Ticket {
        String id PK
        String title
        String description
        Priority priority "LOW | MEDIUM | HIGH | URGENT"
        TicketStatus status "OPEN | IN_PROGRESS | RESOLVED | CLOSED"
        String reporterId FK
        String assigneeId FK "Nullable"
        DateTime firstResponseAt "Nullable"
        DateTime resolvedAt "Nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    Comment {
        String id PK
        String content
        String ticketId FK
        String authorId FK
        DateTime createdAt
    }

    Holiday {
        String id PK
        DateTime date "Date of holiday"
        String name
        DateTime createdAt
    }
```

### Database Indexes:
- `Ticket(status)` — Optimizes status filter in dashboard and listings.
- `Ticket(priority)` — Optimizes priority filter and SLA sorting.
- `Ticket(assigneeId)` — Optimizes agent ticket assignment lookups.
- `Ticket(reporterId)` — Speeds up user-specific ticket listings.
- `Ticket(createdAt)` — Optimizes cursor pagination and chronological sorting.
- `Comment(ticketId)` — Fast comment thread loading.
- `Holiday(date)` — Instant holiday lookups during business-hour walks.

---

## ⏱ SLA Engine & Business Hours Calculation

### 1. Default SLA Policy Matrix

| Priority | First Response SLA | Resolution SLA |
|---|---|---|
| **URGENT** | 1 business hour (60 mins) | 4 business hours (240 mins) |
| **HIGH** | 4 business hours (240 mins) | 24 business hours (1,440 mins) |
| **MEDIUM** | 8 business hours (480 mins) | 48 business hours (2,880 mins) |
| **LOW** | 24 business hours (1,440 mins) | 72 business hours (4,320 mins) |

### 2. Business Hours Configuration
- **Business Days**: Monday through Friday.
- **Business Hours**: 09:00 to 18:00 (9 business hours = 540 business minutes per business day).
- **Exclusions**: Weekends (Saturday & Sunday) and public holidays configured in the `Holiday` table.
- **Timezone**: Configurable via `BUSINESS_TIMEZONE` (default: `Asia/Kolkata`).

### 3. Business Time Arithmetic Algorithm
```
function addBusinessMinutes(startDateTime, minutesNeeded, holidays):
  cursor = snapToNextBusinessMoment(startDateTime, holidays)
  while minutesNeeded > 0:
    dayEnd = 18:00 on date of cursor
    availableToday = minutes between cursor and dayEnd
    if availableToday >= minutesNeeded:
      return cursor + minutesNeeded
    minutesNeeded -= availableToday
    cursor = snapToNextBusinessMoment(start of next day 09:00, holidays)
```

### 4. Snapping Edge Cases (`snapToNextBusinessMoment`)
- **Before Hours** (e.g., Monday 07:00) → Snaps forward to Monday 09:00.
- **After Hours** (e.g., Monday 20:00) → Snaps forward to Tuesday 09:00.
- **Friday Evening** (e.g., Friday 17:59) → 1 minute counts on Friday, remaining time continues Monday 09:00.
- **Weekends** (e.g., Saturday 14:00) → Snaps to Monday 09:00.
- **Public Holidays** (e.g., Monday is a holiday) → Snaps to Tuesday 09:00.

### 5. SLA States & 75% Boundary Rule
- `ON_TRACK`: 0% to 75.0% of the SLA time budget consumed ($0\% \le \text{consumed} \le 75\%$).
- `AT_RISK`: Greater than 75.0% of the SLA budget consumed ($75\% < \text{consumed} \le 100\%$).
- `BREACHED`: SLA deadline has passed and the milestone has not been met ($> 100\%$).

### 6. Clock Freezing
- When an agent adds the first comment (non-reporter), `firstResponseAt` is recorded in UTC. The first-response SLA clock is evaluated against `firstResponseAt` and **permanently frozen**.
- When a ticket is resolved, `resolvedAt` is recorded in UTC. The resolution SLA clock is evaluated against `resolvedAt` and **permanently frozen**.

---

## 🔄 Ticket Status Transition Rules

Valid status lifecycle:
```mermaid
stateDiagram-v2
    [*] --> OPEN : Ticket Created
    OPEN --> IN_PROGRESS : Agent starts work / assigns
    OPEN --> RESOLVED : Direct resolution
    OPEN --> CLOSED : Cancel / Close without resolution
    IN_PROGRESS --> RESOLVED : Agent resolves issue
    IN_PROGRESS --> OPEN : Unassigned / Returned to queue
    IN_PROGRESS --> CLOSED : Closed
    RESOLVED --> CLOSED : Customer or Agent confirms closure
    RESOLVED --> IN_PROGRESS : Ticket Reopened
    CLOSED --> OPEN : Explicit Reopen
```

| Current Status | Allowed Target Statuses | Validation Error Code |
|---|---|---|
| `OPEN` | `IN_PROGRESS`, `RESOLVED`, `CLOSED` | `INVALID_STATUS_TRANSITION` |
| `IN_PROGRESS` | `OPEN`, `RESOLVED`, `CLOSED` | `INVALID_STATUS_TRANSITION` |
| `RESOLVED` | `IN_PROGRESS` (Reopen), `CLOSED` | `INVALID_STATUS_TRANSITION` |
| `CLOSED` | `OPEN` (Explicit Reopen) | `INVALID_STATUS_TRANSITION` |

---

## 🔐 Authentication & Authorization

- **JWT Tokens**: Signed with `JWT_SECRET` carrying user ID, email, and role.
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Roles**:
  - `REPORTER`: Can register, login, create tickets, view accessible tickets, and post comments.
  - `AGENT`: Can view all tickets, assign tickets, change ticket status, resolve tickets, and post comments.
- **Server-Side Enforcement**: GraphQL context extracts the authenticated user from the `Authorization: Bearer <token>` header. Resolvers apply strict permission guards (`requireAuth`, `requireAgent`).

---

## ⚙️ Environment Variables

Create `.env` based on `.env.example`:

```env
# Database connection URL for PostgreSQL
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/burdenoff_db?schema=public"

# JWT Secret for signing and verifying tokens
JWT_SECRET="super-secret-jwt-key-burdenoff-support-tracker-2026"

# Business timezone for SLA calculations
BUSINESS_TIMEZONE="Asia/Kolkata"

# Port for Backend GraphQL Yoga server
PORT=4000
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Bun](https://bun.sh/) (or Node.js v20+ with npm)

### 1-Step Setup
```bash
docker compose up -d && bun install && bun run gendb && bun run dev
```

---

## 🗃 Database Migrations & Seeding

### Apply Migrations
```bash
bun run gendb
```

### Seed Database
```bash
bun run seed
```

#### Pre-seeded Credentials:
| Role | Email | Password |
|---|---|---|
| **Agent** | `agent@example.com` | `password123` |
| **Reporter** | `reporter@example.com` | `password123` |

---

## 💻 Running the Application

### Start All Services (Backend & Frontend concurrently)
```bash
npm run dev:all
```

### Start Individually:
- **Backend**: `npm run dev:backend` (Runs on `http://localhost:4000/graphql`)
- **Frontend**: `npm run dev:frontend` (Runs on `http://localhost:3000`)

---

## 🧪 Testing Strategy (Unit & Integration)

### Run All Tests
```bash
npm run test
```

### Run SLA Engine Unit Tests
```bash
npm run test:unit
```
Covers:
- Standard weekday within hours calculation
- Ticket created before business hours
- Ticket created after business hours
- Friday evening edge-case
- Weekend ticket creation
- Public holiday skipping
- Combined weekend + multi-day holiday spanning
- First-response & resolution deadline calculations
- Transition to `AT_RISK` and `BREACHED`
- SLA Clock freezing verification

### Run Integration Tests against PostgreSQL
```bash
npm run test:integration
```

---

## 📡 Example GraphQL Operations

### 1. Register User
```graphql
mutation Register {
  register(name: "John Doe", email: "john@example.com", password: "password123", role: REPORTER) {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

### 2. Create Ticket
```graphql
mutation CreateTicket {
  createTicket(
    title: "Production database latency spike"
    description: "Database query latency exceeded 2000ms"
    priority: URGENT
  ) {
    id
    title
    priority
    status
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
```

### 3. Add First Response Comment (Freezes First Response SLA)
```graphql
mutation AddComment {
  addComment(ticketId: "TICKET_ID", content: "Investigating the slow query logs now.") {
    id
    content
    createdAt
    author {
      name
      role
    }
  }
}
```

### 4. Fetch Paginated Tickets with Filters
```graphql
query GetTickets {
  tickets(priority: URGENT, slaState: AT_RISK, take: 10) {
    nodes {
      id
      title
      priority
      status
      firstResponseAt
      sla {
        firstResponseState
        resolutionState
        resolutionRemainingMinutes
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 5. Fetch Dashboard Summary
```graphql
query GetDashboard {
  dashboard {
    openTickets
    inProgressTickets
    atRiskTickets
    breachedTickets
  }
}
```

---

## 🚀 How I'd Extend This

1. **SLA Pausing on `WAITING_ON_CUSTOMER`**:
   - Introduce an additional status `WAITING_ON_CUSTOMER`.
   - Track duration spent in this status and dynamically adjust SLA deadlines so agents are not penalized while waiting for customer input.
2. **Multi-Calendar & Per-Team Business Hours**:
   - Allow different support teams to operate under distinct business hours (e.g., 24/7 for Tier 3, 8x5 for Tier 1) and geographic holiday calendars.
3. **Escalation Rules & Automated Webhooks**:
   - Configure alerts via Slack / PagerDuty / Email when an SLA enters `AT_RISK` (>75% budget consumed).
4. **Audit Trail & Event Sourcing**:
   - Full history log tracking who changed ticket priority, status, or assignment with timestamps.
5. **Agent Performance Analytics**:
   - Metrics reporting average first-response time, SLA compliance percentage, and resolution efficiency per agent.
