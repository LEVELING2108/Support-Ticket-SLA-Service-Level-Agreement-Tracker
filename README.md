# 🛡️ Support Ticket & SLA (Service Level Agreement) Tracker

A production-grade, schema-first GraphQL support ticketing platform with a **pure, isolated business-hours SLA engine**.

Built with **TypeScript (Strict Mode)**, **GraphQL Yoga**, **Prisma ORM**, **PostgreSQL 16**, and **React 18 + Tailwind CSS**.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [User Interface & Experience](#-user-interface--experience)
4. [Architecture Overview](#-architecture-overview)
5. [Database Schema & ERD](#-database-schema--erd)
6. [SLA Engine & Calculation Approach](#-sla-engine--calculation-approach)
7. [Status Transition Rules](#-status-transition-rules)
8. [Authentication & Authorization](#-authentication--authorization)
9. [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
10. [Environment Variables](#-environment-variables)
11. [Setup & Installation](#-setup--installation)
12. [Database Migrations & Seeding](#-database-migrations--seeding)
13. [Running the Application](#-running-the-application)
14. [Testing Strategy](#-testing-strategy)
15. [Example GraphQL Operations](#-example-graphql-operations)
16. [How I'd Extend This](#-how-id-extend-this)

---

## 🎯 Project Overview

In real-world enterprise customer support, Service Level Agreements (SLAs) are measured strictly in **business hours**, not wall-clock hours:
- **Operating Hours**: Monday through Friday, 09:00 to 18:00 (9 hours / 540 minutes per working day).
- **Exclusions**: Nights (outside 09:00–18:00), weekends (Saturday & Sunday), and configured public holidays never consume SLA time.
- **Backend as Single Source of Truth**: The GraphQL backend calculates all due dates, remaining minutes, and SLA states (`ON_TRACK`, `AT_RISK`, `BREACHED`). The frontend strictly displays these values and never computes SLA status locally.
- **Milestone Clock Freezing**: When an SLA milestone occurs (first comment by a non-reporter for `firstResponseAt`, or ticket resolution for `resolvedAt`), the SLA clock freezes permanently and can never retroactively breach.

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
[![Live Render API](https://img.shields.io/badge/Render-Live_API_Active-46E3B7?style=flat-square&logo=render&logoColor=white)](https://support-ticket-tracker-sla.onrender.com/graphql)
[![Deployment Guide](https://img.shields.io/badge/Deployment-Guide_Available-000000?style=flat-square&logo=gitbook&logoColor=white)](./DEPLOYMENT.md)

</div>

<br/>

> 🌐 **Live Cloud Backend**: `https://support-ticket-tracker-sla.onrender.com/graphql`  
> 📖 **Cloud Deployment Guide**: [`DEPLOYMENT.md`](./DEPLOYMENT.md)

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
| **Frontend UI** | `React 18` + `Vite` + `Tailwind CSS` | Clean minimalist dashboard with custom SVG progress rings & icons |
| **GraphQL Client** | `Urql 4.1` | Lightweight GraphQL client with auth exchange |
| **Testing** | `Vitest 1.6` | High-performance unit and real PostgreSQL integration test runner |
| **Linting** | `ESLint 8.57` + `@typescript-eslint` | Enforced `@typescript-eslint/no-explicit-any: error` |

---

## 🎨 User Interface & Experience

The user interface follows a modern, high-density minimalist aesthetic:

1. **Starting / Landing Page**:
   - Header with brand shield logo + `SLA ENGINE` badge pill.
   - Timezone pill: `● Mon-Fri 09:00-18:00 Asia/Kolkata`.
   - 1-Click Launch buttons: `[Launch Dashboard]`, `[Enter as Agent]`, and `[Enter as Reporter]` (executing live backend authentication).
   - 3 Architectural Pillar cards explaining Business Hours, Milestone Freezing, and Authoritative Engine calculations.
2. **Main Management Dashboard**:
   - Subheader showing live engine status (`● Engine Active`), timezone (`Asia/Kolkata`), and active public holiday count.
   - 4 Metric Counter Cards with colored status dots (`Open Tickets`, `In Progress`, `SLA At Risk`, `SLA Breached`).
   - Integrated Filter & Search bar (`Status ▾`, `Priority ▾`, `SLA State ▾`, `Assignee ▾` + Reset).
   - High-density data table with outline pill badges, ticket summary previews, assignee chips, SVG progress rings for both First Response and Resolution SLAs, and relative/absolute timestamps.
3. **Dual-Pane Ticket Detail Modal**:
   - Left Pane (65%): Full description, activity & comment stream with highlighted First Response SLA Milestone box (`🎯 1st Response SLA Milestone (Clock Frozen)`), and inline reply composer.
   - Right Pane (35%): Live SLA Countdown cards with circular progress rings, ticket metadata, and Support Agent Action Center (agent reassignment, segmented status toggle `[ OPEN | PROG | RESOLVED ]`, and one-click `Resolve Ticket` button).
4. **Create Ticket Modal**:
   - Title input with `min 3 chars` validation.
   - Description input with `min 5 chars` validation.
   - 4-column Priority Selector grid displaying SLA targets (`URGENT: 1h/4h`, `HIGH: 4h/24h`, `MEDIUM: 8h/48h`, `LOW: 24h/72h`).
5. **Auth Modal**:
   - Clean Login and Register tabs with show/hide password toggle.
   - Quick Demo Access strip with 1-click Agent and Reporter buttons.

---

## 🏗️ Architecture Overview

The system follows a strict layered, decoupled architecture where business logic is completely isolated from GraphQL resolvers and transport layers:

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (React 18 + Vite + Tailwind)"]
        UI[Starting Page & Dashboard Workbench]
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

    subgraph Persistence ["Persistence Layer (PostgreSQL 16)"]
        Prisma[Prisma Client ORM]
        Postgres[(Dockerized PostgreSQL 16 DB)]
        AuthSvc --> Prisma
        TicketSvc --> Prisma
        Prisma --> Postgres
    end
```

---

## 🗄️ Database Schema & ERD

The database schema is managed via **Prisma ORM** with relational integrity, foreign key constraints, and performance indexes on `status`, `priority`, and `reporterId`.

```mermaid
erDiagram
    User ||--o{ Ticket : reports
    User ||--o{ Ticket : assigned_to
    User ||--o{ Comment : authors
    Ticket ||--o{ Comment : contains
    Holiday

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
        DateTime firstResponseAt "Nullable (Milestone Freeze)"
        DateTime resolvedAt "Nullable (Milestone Freeze)"
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
        DateTime date UK
        String name
        DateTime createdAt
    }
```

---

## ⏱️ SLA Engine & Calculation Approach

### 1. SLA Targets by Priority
| Priority | First Response SLA | Resolution SLA | Total Business Minutes |
|---|---|---|---|
| **URGENT** | 1 business hour | 4 business hours | 60m response / 240m resolution |
| **HIGH** | 4 business hours | 24 business hours (2.67 business days) | 240m response / 1,440m resolution |
| **MEDIUM** | 8 business hours | 48 business hours (5.33 business days) | 480m response / 2,880m resolution |
| **LOW** | 24 business hours | 72 business hours (8.00 business days) | 1,440m response / 4,320m resolution |

### 2. Timezone & Operating Hours Normalization
- **Working Window**: 09:00:00 to 18:00:00 in `Asia/Kolkata` (configurable via `BUSINESS_TIMEZONE`).
- **Snapping**: If a ticket is created outside working hours (nights, weekends, or holidays), the clock start is snapped forward to **09:00:00 on the next valid business day**.
- **Day-Walking**: When adding business minutes, the engine calculates remaining minutes on the current day. If remaining time exceeds available business minutes before 18:00, it advances to 09:00 on the next business day (skipping weekends and configured holidays).

### 3. SLA State & The 75% Boundary Rule
- $\text{Consumed Ratio} = \frac{\text{Elapsed Business Minutes}}{\text{Total Target Budget Minutes}}$
- **`ON_TRACK`**: $\text{Consumed Ratio} \le 0.75$ ($75.0\%$).
- **`AT_RISK`**: $\text{Consumed Ratio} > 0.75$ and not yet breached.
- **`BREACHED`**: Deadline has passed without completion, or milestone timestamp exceeded the target deadline.

### 4. Milestone Freezing Guarantee
- **First Response Milestone**: The first comment where `comment.authorId !== ticket.reporterId` sets `ticket.firstResponseAt`. The first response SLA clock is permanently locked to the time between creation and first response.
- **Resolution Milestone**: When transitioning to `RESOLVED`, `ticket.resolvedAt` is stamped. The resolution SLA clock is permanently locked.
- **Invariant**: Once frozen, remaining minutes is returned as `0` and the SLA state remains immutable.

---

## 🔄 Status Transition Rules

The ticketing lifecycle enforces valid status transitions via `TicketService.changeStatus`:

```mermaid
stateDiagram-v2
    [*] --> OPEN : Ticket Created
    OPEN --> IN_PROGRESS : Agent starts work
    OPEN --> RESOLVED : Direct resolution
    IN_PROGRESS --> RESOLVED : Issue fixed (freezes resolvedAt)
    RESOLVED --> CLOSED : Customer/Agent accepts fix
    RESOLVED --> IN_PROGRESS : Reopened by customer
    CLOSED --> [*]
```

- Invalid transitions (e.g. `CLOSED` $\to$ `OPEN`, or non-agents attempting status changes) throw standardized GraphQL errors (`INVALID_STATUS_TRANSITION`, `FORBIDDEN`).

---

## 🔐 Authentication & Authorization

- **Password Security**: Hashed using `bcryptjs` with 10 salt rounds.
- **Token Format**: Signed JSON Web Tokens (JWT) with standard `Bearer <token>` in the `Authorization` header.
- **Role Permissions**:
  - `REPORTER`: Can create tickets, query tickets they reported, and post comments on any ticket.
  - `AGENT`: Can view all tickets, create tickets, reassign tickets, update statuses, resolve tickets, and post staff comments.
- **Standardized GraphQL Error Codes**:
  - `UNAUTHORIZED`: Missing or invalid authentication token.
  - `FORBIDDEN`: User role lacks permission for the requested mutation.
  - `VALIDATION_ERROR`: Malformed input (e.g. password < 6 chars, title < 3 chars).
  - `TICKET_NOT_FOUND`: Target ticket ID does not exist.
  - `INVALID_STATUS_TRANSITION`: Attempted lifecycle violation.

---

## 👥 Pre-Seeded Demo Accounts

The database comes pre-seeded with ready-to-use accounts and tickets:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Support Agent** | `agent@example.com` | `password123` | Full access: assign tickets, transition status, resolve issues, post replies |
| **Reporter** | `reporter@example.com` | `password123` | Create tickets, view SLA progress, post comments |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/burdenoff?schema=public"
JWT_SECRET="super-secret-jwt-key-for-development"
JWT_EXPIRES_IN="7d"
BUSINESS_TIMEZONE="Asia/Kolkata"
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Bun** (v1.1+) or **Node.js** (v20+)
- **Docker** & **Docker Compose**

### Step 1: Clone Repository
```bash
git clone https://github.com/LEVELING2108/Support-Ticket-SLA-Service-Level-Agreement-Tracker.git
cd Support-Ticket-SLA-Service-Level-Agreement-Tracker
```

### Step 2: Start PostgreSQL Database Container
```bash
docker compose up -d
```

### Step 3: Install Dependencies
```bash
# Install backend dependencies
bun --cwd backend install

# Install frontend dependencies
bun --cwd frontend install
```

---

## 🗃️ Database Migrations & Seeding

```bash
# Generate Prisma Client & Run Migrations
bun --cwd backend prisma migrate dev --name init

# Seed initial users, holidays, and tickets
bun run backend/prisma/seed.ts
```

---

## 💻 Running the Application

### Start Backend API Server (Port 4000)
```bash
bun --cwd backend dev
# GraphQL Playground available at: http://localhost:4000/graphql
```

### Start Frontend Dev Server (Port 5173)
```bash
bun --cwd frontend dev
# Web application available at: http://localhost:5173
```

## 📂 Project Structure

```text
Support-Ticket-SLA-Service-Level-Agreement-Tracker/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                 # Monorepo CI: lint, typecheck, build, test
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # Version-controlled Prisma schema migrations
│   │   ├── schema.prisma          # Relational data models and indexes
│   │   └── seed.ts                # Deterministic database seeder
│   ├── src/
│   │   ├── auth/                  # JWT token utilities, password hashing & guards
│   │   ├── errors/                # Standardized AppGraphQLError hierarchy
│   │   ├── graphql/               # Schema-first SDL, context & strongly-typed resolvers
│   │   ├── services/              # Pure SLA engine, ticket lifecycle & auth services
│   │   └── server.ts              # GraphQL Yoga HTTP server & graceful shutdown
│   ├── tests/
│   │   ├── unit/                  # 56 isolated unit tests for business logic
│   │   └── integration/           # Real PostgreSQL integration lifecycle tests
│   ├── codegen.yml                # GraphQL Code Generator configuration
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # UI Modals, Badges, Tables, Dashboard cards
│   │   ├── context/               # AuthContext state and custom useAuth hook
│   │   ├── graphql/               # Typed GraphQL query and mutation documents
│   │   ├── lib/                   # URQL GraphQL client with Bearer auth exchange
│   │   ├── types/                 # Frontend TypeScript interfaces
│   │   ├── App.tsx                # Main view router and modal manager
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── .env.example                   # Sanitized placeholder configuration template
├── .gitignore                     # Production-ready git ignore rules
├── docker-compose.yml             # PostgreSQL 16 Alpine container configuration
├── render.yaml                    # Infrastructure-as-Code for Render Cloud deployment
├── package.json                   # Monorepo workspace orchestration
├── README.md                      # Complete system documentation
└── LICENSE                        # MIT License
```

---

## 📑 API Documentation & Specification

| Method / Type | Operation | Authentication | Authorization | Input Validation | Main Purpose |
|---|---|---|---|---|---|
| `Query` | `me: User` | Yes (Bearer JWT) | Any logged-in user | None | Returns current user profile |
| `Query` | `users(role: UserRole): [User!]!` | Yes (Bearer JWT) | `requireAuth` | Role enum validation | Lists users for agent assignment dropdowns |
| `Query` | `holidays: [Holiday!]!` | No (Public) | Public | None | Lists calendar holidays for SLA engine |
| `Query` | `ticket(id: ID!): Ticket` | Yes (Bearer JWT) | `requireAuth` | ID existence check | Fetches single ticket with comments & SLA info |
| `Query` | `tickets(status, priority, assigneeId, slaState, take, cursor): TicketConnection!` | Yes (Bearer JWT) | `requireAuth` | Pagination bounds (1-50), enums | Paginated cursor list with eager-loaded relations |
| `Query` | `dashboard: TicketDashboard!` | Yes (Bearer JWT) | `requireAuth` | None | Real-time ticket metric counters |
| `Mutation` | `register(name, email, password, role): AuthPayload!` | No (Public) | Public | Name (2-100), Email regex, Password (6-72 chars) | Registers user, hashes password, returns JWT |
| `Mutation` | `login(email, password): AuthPayload!` | No (Public) | Public | Email format, Password verification | Authenticates credentials, returns signed JWT |
| `Mutation` | `createTicket(title, description, priority): Ticket!` | Yes (Bearer JWT) | `requireAuth` | Title (min 3), Desc (min 5), Priority enum | Creates support ticket in `OPEN` state |
| `Mutation` | `assignTicket(ticketId, assigneeId): Ticket!` | Yes (Bearer JWT) | `requireAgent` | Ticket ID & Assignee ID existence, AGENT role | Assigns support staff to ticket |
| `Mutation` | `changeTicketStatus(ticketId, status): Ticket!` | Yes (Bearer JWT) | `requireAgent` | Status enum, state machine allowed transitions | Updates lifecycle status; manages `resolvedAt` |
| `Mutation` | `addComment(ticketId, content): Comment!` | Yes (Bearer JWT) | `requireAuth` | Ticket ID, non-empty comment content | Adds reply; triggers 1st response milestone |
| `Mutation` | `resolveTicket(ticketId): Ticket!` | Yes (Bearer JWT) | `requireAgent` | Ticket ID existence, allowed transition | Resolves ticket and freezes resolution SLA |

---

## 🧪 Testing Strategy

The test suite covers pure mathematics, services, and real PostgreSQL database integration tests:

```bash
# Run backend unit tests
npm run test:unit --workspace=backend
# or with Bun:
bun --cwd backend test:unit
```

### Automated Test Coverage (56 Unit Tests + Integration Tests Passed):
- `tests/unit/businessHours.test.ts` (15 tests):
  - Snapping before/after hours, weekend day-walking, holiday skipping, exact minute boundary calculations.
- `tests/unit/slaEngine.test.ts` (12 tests):
  - 75% boundary transition to `AT_RISK`, deadline overdue to `BREACHED`, milestone clock freezing.
- `tests/unit/ticketService.test.ts` (12 tests):
  - Status transition state machine validation, title/desc length validation, non-reporter first comment milestone stamping.
- `tests/unit/auth.test.ts` (9 tests):
  - Bcrypt hashing, token issuance, invalid credential handling, role authorization guards, password length upper bound (72 chars).
- `tests/unit/index.test.ts` (8 tests):
  - AppError class hierarchy, standardized error codes, HTTP status mapping.
- `tests/integration/ticketFlow.integration.test.ts` (8 tests):
  - Real PostgreSQL full lifecycle: register $\to$ create ticket $\to$ agent reply $\to$ resolve $\to$ SLA validation.

---

## 📡 Example GraphQL Operations

### 1. User Login
```graphql
mutation LoginUser {
  login(email: "agent@example.com", password: "password123") {
    token
    user {
      id
      name
      role
    }
  }
}
```

### 2. Create Ticket
```graphql
mutation CreateNewTicket {
  createTicket(
    title: "Payment gateway timeout on checkout"
    description: "Customers receiving 500 error when completing Stripe payments."
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

### 3. Add Milestone Agent Comment
```graphql
mutation AddAgentReply($ticketId: ID!) {
  addComment(
    ticketId: $ticketId
    content: "Investigating the payment gateway connection pool."
  ) {
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

### 4. Query Dashboard Summary
```graphql
query GetDashboardStats {
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

1. **SLA Pause on `WAITING_ON_CUSTOMER` Status**:
   - Add a `WAITING_ON_CUSTOMER` status. Record paused time intervals and extend target deadlines by the exact business minutes spent waiting.
2. **Multi-Timezone & Per-Team Business Calendars**:
   - Support custom team schedules (e.g. 24/7 for Tier-3 DevOps, 8x5 for Tier-1 Support).
3. **Automated Alerts & Escalations**:
   - Background worker monitoring tickets entering `AT_RISK` and dispatching webhooks to Slack/PagerDuty.
4. **Real-Time GraphQL Subscriptions**:
   - WebSocket / SSE live updates pushing countdown ticks directly to open browser sessions.
