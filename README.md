# 🛡️ Support Ticket & SLA (Service Level Agreement) Tracker

A production-grade, schema-first GraphQL support ticketing platform with a **pure, isolated business-hours SLA engine**.

Built with **TypeScript (Strict Mode)**, **GraphQL Yoga**, **Prisma ORM**, **PostgreSQL 16**, and **React 18 + Tailwind CSS**.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Architecture Overview](#-architecture-overview)
4. [Database Schema & ERD](#-database-schema--erd)
5. [SLA Engine & Calculation Approach](#-sla-engine--calculation-approach)
6. [Status Transition Rules](#-status-transition-rules)
7. [Authentication & Authorization](#-authentication--authorization)
8. [Environment Variables](#-environment-variables)
9. [Setup & Installation](#-setup--installation)
10. [Database Migrations & Seeding](#-database-migrations--seeding)
11. [Running the Application](#-running-the-application)
12. [Testing Strategy](#-testing-strategy)
13. [Example GraphQL Operations](#-example-graphql-operations)
14. [How I'd Extend This](#-how-id-extend-this)

---

## 🎯 Project Overview

In real-world enterprise customer support, Service Level Agreements (SLAs) are measured strictly in **business hours**, not wall-clock hours:
- **Operating Hours**: Monday through Friday, 09:00 to 18:00 (9 hours / 540 minutes per working day).
- **Exclusions**: Nights (outside 09:00–18:00), weekends (Saturday & Sunday), and configured public holidays never consume SLA time.
- **Backend as Single Source of Truth**: The GraphQL backend calculates all due dates, remaining minutes, and SLA states (`ON_TRACK`, `AT_RISK`, `BREACHED`). The frontend strictly displays these values and never computes SLA status locally.
- **Clock Freezing**: When an SLA milestone occurs (first comment by a non-reporter for `firstResponseAt`, or ticket resolution for `resolvedAt`), the SLA clock freezes permanently and can never retroactively breach.

---

## 💻 Tech Stack

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript_5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun_1.1-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
[![Node.js](https://img.shields.io/badge/Node.js_20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![GraphQL Yoga](https://img.shields.io/badge/GraphQL_Yoga_5-E10098?style=flat-square&logo=graphql&logoColor=white)](https://the-guild.dev/graphql/yoga-server)
[![Prisma](https://img.shields.io/badge/Prisma_5-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)

</div>

<br/>

| Component | Technology | Description |
|---|---|---|
| **Runtime** | `Bun` / `Node.js (v20+)` | High-performance JavaScript/TypeScript runtime & package manager |
| **Language** | `TypeScript 5.6 (Strict Mode)` | Strict type safety (`noImplicitAny`, zero `any`) |
| **API Server** | `GraphQL Yoga 5.7` | Schema-first GraphQL server with Yoga context & error mapping |
| **Code Generation** | `@graphql-codegen` | Generates strict TypeScript resolver types from SDL schemas |
| **ORM** | `Prisma 5.22` | Type-safe query builder, migrations & relational constraints |
| **Database** | `PostgreSQL 16 (Alpine)` | Relational database containerized in Docker Compose |
| **Date Arithmetic** | `date-fns` & `date-fns-tz` | Pure timezone-aware business calendar math engine |
| **Authentication** | `bcryptjs` + `jsonwebtoken` | Secure password hashing (10 salt rounds) + signed JWTs |
| **Frontend UI** | `React 18` + `Vite` + `Tailwind CSS` | Full-page responsive dashboard with custom handcrafted SVG icons |
| **GraphQL Client** | `Urql 4.1` | Lightweight GraphQL client with auth exchange |
| **Testing** | `Vitest 1.6` | High-performance unit and real PostgreSQL integration test runner |
| **Linting** | `ESLint 8.57` + `@typescript-eslint` | Enforced `@typescript-eslint/no-explicit-any: error` |

---

## 🏗️ Architecture Overview

The system follows a strict layered, decoupled architecture where business logic is completely isolated from GraphQL resolvers and transport layers:

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (React 18 + Vite + Tailwind)"]
        UI[Responsive Full-Width Dashboard]
        Urql[Urql GraphQL Client + Auth Header]
        UI <--> Urql
    end

    subgraph API ["API & Transport Layer (GraphQL Yoga)"]
        Context[createContext: PrismaClient + Bearer JWT Guard]
        SDL[Schema-First SDL Contract .graphql]
        Resolvers[Strongly-Typed Resolvers]
        Urql -->|HTTP POST /graphql| Context
        Context --> Resolvers
        SDL --> Resolvers
    end

    subgraph CoreServices ["Core Business Services (Isolated)"]
        AuthSvc[AuthService: Password Hash + JWT Sign]
        TicketSvc[TicketService: Transitions & Validations]
        SLAEngine[SLAEngine: Pure Business-Hours Math]
        Resolvers --> AuthSvc
        Resolvers --> TicketSvc
        Resolvers --> SLAEngine
        TicketSvc --> SLAEngine
    end

    subgraph Data ["Persistence Layer (PostgreSQL 16)"]
        Prisma[Prisma Client ORM]
        Postgres[(Docker PostgreSQL Container)]
        AuthSvc --> Prisma
        TicketSvc --> Prisma
        Prisma --> Postgres
    end
```

---

## 🗄️ Database Schema & ERD

The schema is defined in [`backend/prisma/schema.prisma`](file:///C:/Users/suman/Downloads/PERSONAL%20PROJECT/Burdenoff/backend/prisma/schema.prisma) with explicit relations, enums, and optimized database indexes:

```mermaid
erDiagram
    User ||--o{ Ticket : "reports"
    User ||--o{ Ticket : "assigned_to"
    User ||--o{ Comment : "authors"
    Ticket ||--o{ Comment : "contains"

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
        Priority priority "URGENT | HIGH | MEDIUM | LOW"
        TicketStatus status "OPEN | IN_PROGRESS | RESOLVED | CLOSED"
        String reporterId FK
        String assigneeId FK "optional"
        DateTime createdAt
        DateTime updatedAt
        DateTime firstResponseAt "optional milestone"
        DateTime resolvedAt "optional milestone"
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
        String date UK "YYYY-MM-DD"
        String name
        DateTime createdAt
    }
```

### Strategic Indexes:
- `Ticket(status)` & `Ticket(priority)` — High-frequency dashboard counter and filter operations.
- `Ticket(reporterId)` & `Ticket(assigneeId)` — Role-based ticket ownership filtering.
- `Ticket(createdAt)` — Efficient cursor-based pagination ordering.
- `Holiday(date)` — $O(1)$ unique lookup for date holiday exclusion.

---

## ⏱️ SLA Engine & Calculation Approach

### 1. Default SLA Policies:
| Priority | First Response SLA Target | Resolution SLA Target |
|---|---|---|
| **URGENT** | 1 business hour (60 mins) | 4 business hours (240 mins) |
| **HIGH** | 4 business hours (240 mins) | 24 business hours (1,440 mins) |
| **MEDIUM** | 8 business hours (480 mins) | 48 business hours (2,880 mins) |
| **LOW** | 24 business hours (1,440 mins) | 72 business hours (4,320 mins) |

### 2. Business Hours Arithmetic Algorithm (`addBusinessMinutes`):
```text
function addBusinessMinutes(startTime, minutesNeeded, holidays, config):
  cursor = snapToNextBusinessMoment(startTime, holidays, config)
  while minutesNeeded > 0:
    endOfWorkToday = 18:00 on cursor's day
    availableMinutesToday = difference(endOfWorkToday, cursor)
    if availableMinutesToday >= minutesNeeded:
      return cursor + minutesNeeded
    minutesNeeded = minutesNeeded - availableMinutesToday
    cursor = snapToNextBusinessMoment(tomorrow 09:00, holidays, config)
```

### 3. Edge-Case Snapping (`snapToNextBusinessMoment`):
- **Before Hours** (e.g. Mon 07:00) $\to$ Snaps forward to Mon 09:00.
- **After Hours** (e.g. Mon 20:00) $\to$ Snaps forward to Tue 09:00.
- **Friday Evening** (e.g. Fri 17:59) $\to$ 1 minute counts on Friday, remaining time continues Mon 09:00.
- **Weekends** (e.g. Sat 14:00) $\to$ Snaps forward to Mon 09:00.
- **Public Holidays** (e.g. Mon is a holiday) $\to$ Snaps forward to Tue 09:00.

### 4. SLA States & The 75% Boundary Rule:
$$\text{Consumed Ratio} = \frac{\text{Elapsed Business Minutes}}{\text{Total SLA Target Minutes}}$$

- **`ON_TRACK`**: $0\% \le \text{Consumed Ratio} \le 75.0\%$
- **`AT_RISK`**: $\text{Consumed Ratio} > 75.0\%$ and current time is before the SLA due date.
- **`BREACHED`**: Current time has passed the SLA due date without milestone completion, or milestone completed after the due date.

### 5. Clock Freezing:
- **First Response**: The first comment created by someone other than the ticket reporter (`authorId !== reporterId`) permanently stamps `firstResponseAt`. Subsequent comments do not alter this timestamp.
- **Resolution**: Transitioning to `RESOLVED` permanently stamps `resolvedAt`.
- Once stamped, the SLA state is permanently frozen and can never retroactively breach.

---

## 🔄 Status Transition Rules

Ticket state changes strictly follow a server-side state machine:

```mermaid
stateDiagram-v2
    [*] --> OPEN : createTicket
    OPEN --> IN_PROGRESS : assignTicket / start work
    OPEN --> RESOLVED : resolveTicket (direct)
    OPEN --> CLOSED : Close
    IN_PROGRESS --> RESOLVED : resolveTicket (sets resolvedAt)
    IN_PROGRESS --> OPEN : Return to Queue
    IN_PROGRESS --> CLOSED : Close
    RESOLVED --> CLOSED : Customer Confirmation
    RESOLVED --> IN_PROGRESS : Reopen
    CLOSED --> OPEN : Explicit Reopen
```

| Current Status | Allowed Target Statuses | Disallowed Statuses |
|---|---|---|
| `OPEN` | `IN_PROGRESS`, `RESOLVED`, `CLOSED` | — |
| `IN_PROGRESS` | `OPEN`, `RESOLVED`, `CLOSED` | — |
| `RESOLVED` | `IN_PROGRESS` (Reopen), `CLOSED` | `OPEN` |
| `CLOSED` | `OPEN` (Explicit Reopen) | `IN_PROGRESS`, `RESOLVED` |

Any rejected transition returns a standard GraphQL error with code `INVALID_STATUS_TRANSITION`.

---

## 🔐 Authentication & Authorization

- **Password Hashing**: Bcrypt with 10 salt rounds (`backend/src/auth/password.ts`).
- **Token Format**: Signed JSON Web Tokens (JWT) with standard expiration (`backend/src/auth/jwt.ts`).
- **Server-Side Guards**:
  - `requireAuth(context)` — Ensures request has a valid JWT Bearer token.
  - `requireAgent(context)` — Ensures authenticated user has the `AGENT` role.
- **Machine-Readable Error Codes**:
  `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `TICKET_NOT_FOUND`, `USER_NOT_FOUND`, `INVALID_STATUS_TRANSITION`, `INVALID_PRIORITY`.

---

## ⚙️ Environment Variables

All settings are configured in `.env` (template provided in `.env.example`):

| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgrespassword@localhost:5432/burdenoff_db?schema=public` | PostgreSQL connection URL |
| `JWT_SECRET` | `super-secret-jwt-key-burdenoff-support-tracker-2026` | Secret key used to sign JWTs |
| `BUSINESS_TIMEZONE` | `Asia/Kolkata` | Timezone used for SLA business hours math |
| `PORT` | `4000` | GraphQL Yoga HTTP port |

---

## 🚀 Setup & Installation

### Single-Command Setup Flow:
```bash
docker compose up -d && bun install && bun run gendb && bun run dev:all
```

*(If using npm/Node.js instead of Bun: `docker compose up -d && npm install && npm run gendb && npm run dev:all`)*

---

## 🗃️ Database Migrations & Seeding

### Apply Migrations:
```bash
bun run gendb
# or: cd backend && bunx prisma migrate dev
```

### Seed Database:
```bash
bun run seed
```

### Pre-Seeded User Accounts:
| Role | Email | Password | Permissions |
|---|---|---|---|
| **Support Agent** | `agent@example.com` | `password123` | Assign tickets, change status, resolve, comment |
| **Reporter** | `reporter@example.com` | `password123` | Create tickets, view tickets, add comments |

---

## 🏃 Running the Application

### Option A: Run Concurrently (Recommended)
```bash
npm run dev:all
```

### Option B: Run Processes Separately
```bash
# Terminal 1 — Backend GraphQL Yoga API (Port 4000)
bun --cwd backend dev

# Terminal 2 — Frontend React UI (Port 5173)
bun --cwd frontend dev
```

- **Frontend App**: `http://localhost:5173`
- **GraphQL Playground**: `http://localhost:4000/graphql`

---

## 🧪 Testing Strategy

The project contains **52 automated tests** across unit and integration suites:

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run PostgreSQL integration tests
npm run test:integration
```

### Test Suite Breakdown:
1. `tests/unit/businessHours.test.ts` (15 tests) — Weekday math, before-hours, after-hours, Friday 17:59, weekends, single/multi-day holidays, multi-day spans (4h, 8h, 24h, 48h, 72h).
2. `tests/unit/slaEngine.test.ts` (12 tests) — 75% boundary threshold, `AT_RISK`, `BREACHED`, countdown math, and permanent clock freezing.
3. `tests/unit/auth.test.ts` (7 tests) — Password hashing, JWT signing/verification, `requireAuth`, `requireAgent`.
4. `tests/unit/ticketService.test.ts` (9 tests) — Ticket creation validation and status transition state machine.
5. `tests/integration/ticketFlow.integration.test.ts` (8 tests) — **Real PostgreSQL integration test** verifying registration $\to$ ticket creation $\to$ reporter comment $\to$ agent comment milestone trigger $\to$ assignment $\to$ status transitions $\to$ resolution.

---

## 📡 Example GraphQL Operations

### 1. User Login Mutation
```graphql
mutation LoginUser {
  login(email: "agent@example.com", password: "password123") {
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

### 2. Create Ticket Mutation
```graphql
mutation CreateTicket {
  createTicket(
    title: "Database connection latency spike"
    description: "High latency observed on replica cluster during peak hours."
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

### 3. Query Paginated Tickets with Filters
```graphql
query GetFilteredTickets {
  tickets(priority: URGENT, slaState: ON_TRACK, take: 10) {
    nodes {
      id
      title
      priority
      status
      reporter {
        name
      }
      assignee {
        name
      }
      sla {
        firstResponseState
        firstResponseRemainingMinutes
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

### 4. Query Dashboard Summary
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

## 🔮 How I'd Extend This

With additional development time, here are the architectural extensions to implement:

1. **SLA Pause on `WAITING_ON_CUSTOMER` Status**:
   - Introduce a `WAITING_ON_CUSTOMER` ticket status.
   - Record time intervals spent waiting and dynamically add those business minutes to the SLA target deadlines (`firstResponseDueAt` and `resolutionDueAt`).
2. **Multi-Timezone & Per-Team Business Calendars**:
   - Add a `Team` model with localized business hours (e.g. 24/7 for Tier-3 DevOps, 8x5 for Tier-1 Support).
   - Dynamically look up the team's calendar and timezone when computing SLAs.
3. **Automated Escalation & Notifications**:
   - Background cron worker monitoring tickets entering the `AT_RISK` state (>75% budget consumed).
   - Dispatch alerts via Webhooks to Slack, Discord, or PagerDuty.
4. **Comprehensive Audit Trail**:
   - `TicketAuditLog` model recording every status change, reassignment, priority update, and comment with actor IDs and precise UTC timestamps.
5. **Real-Time GraphQL Subscriptions**:
   - Implement WebSocket/SSE subscriptions via GraphQL Yoga to push live SLA timer ticks and ticket updates directly to active dashboards.
