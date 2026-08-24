# Support Ticket & SLA Tracker — Take-Home Assignment

## Objective
Build a Support Ticket & SLA (Service Level Agreement) Tracker where users raise tickets, agents (support staff) work on them, and every ticket has an SLA deadline calculated using **business hours only**.

**Core rule:** SLA time is measured in business hours, not wall-clock hours. Nights, weekends, and holidays never count against an SLA.

Evaluated on: application architecture, GraphQL API design, database modeling, business-logic implementation, testing, code quality.

Estimated time: 4–6 focused hours. Submit within 3–5 days.

---

## 1. Runtime & Language
- Bun or Node.js
- TypeScript, **strict mode**
- `any` is **not allowed** anywhere
- Proper types throughout; configure type-checking + linting

## 2. API — GraphQL Yoga (schema-first)
- Use GraphQL Yoga
- **Schema-first**: define schema in `.graphql` files, implement resolvers separately in TS. Do NOT use code-first.

### Core types
```graphql
type Ticket {
  id: ID!
  title: String!
  description: String!
  priority: Priority!
  status: TicketStatus!
  reporter: User!
  assignee: User
  createdAt: String!
  firstResponseAt: String
  resolvedAt: String
  sla: SLAInfo!
}

enum Priority { LOW MEDIUM HIGH URGENT }
enum TicketStatus { OPEN IN_PROGRESS RESOLVED CLOSED }
```

### Queries (must support)
```graphql
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
```
Must support: paginated ticket listing, filter by status/priority/assignee/SLA state, fetch single ticket, dashboard summary, users/agents list, configured holidays.

## 3. Mutations (at least)
```graphql
createTicket(title: String!, description: String!, priority: Priority!): Ticket!
assignTicket(ticketId: ID!, assigneeId: ID!): Ticket!
changeTicketStatus(ticketId: ID!, status: TicketStatus!): Ticket!
addComment(ticketId: ID!, content: String!): Comment!
resolveTicket(ticketId: ID!): Ticket!

register(name: String!, email: String!, password: String!, role: UserRole!): AuthPayload!
login(email: String!, password: String!): AuthPayload!
```
May restrict who can register as AGENT.

## 4. Database — PostgreSQL + Prisma
- Postgres, Prisma ORM, Docker Compose for Postgres
- Use `prisma migrate dev`; commit migration files
- No manual SQL schema edits
- Sensible indexes on commonly-filtered fields
- Proper Prisma relations/constraints

### Core models
`User`, `Ticket`, `Comment`, `Holiday`

Ticket must contain at least: title, description, priority, status, reporter, optional assignee, createdAt, firstResponseAt, resolvedAt.
Comments must belong to a ticket and record their author.

## 5. Authentication & Authorization
- Roles: `REPORTER`, `AGENT`
- Registration + login
- Passwords hashed (bcrypt or Argon2) — never plaintext
- Authenticated users can create tickets
- Agent-specific actions: assign ticket, change status, resolve ticket
- All authorization enforced **server-side**

## 6. Validation (server-side only)
Reject with proper GraphQL errors (never unhandled 500s). At minimum validate:
- Empty ticket title / description
- Invalid priority
- Empty comment
- Non-existent ticket / assignee
- Invalid status transition
- Unauthorized operation

Error codes: `VALIDATION_ERROR`, `TICKET_NOT_FOUND`, `USER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_STATUS_TRANSITION`, `INVALID_PRIORITY`, `INVALID_COMMENT`

## 7. Ticket Status Transitions
Default flow: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
Prevent invalid transitions (e.g. `CLOSED → IN_PROGRESS` unless explicitly reopened). Enforce server-side. Document chosen rules in README. Return clear `INVALID_STATUS_TRANSITION` errors.

## 8. SLA Engine (most important part)
Must be server-side, isolated into a dedicated testable module — **not scattered in resolvers**.

### Default SLA policy
| Priority | First Response | Resolution |
|---|---|---|
| URGENT | 1 business hour | 4 business hours |
| HIGH | 4 business hours | 24 business hours |
| MEDIUM | 8 business hours | 48 business hours |
| LOW | 24 business hours | 72 business hours |

(Make configurable if desired, but these are the defaults.)

### Business hours
- Mon–Fri, 09:00–18:00 (9 business hours/day)
- Weekends and configured holidays don't count
- One configured timezone, e.g. `BUSINESS_TIMEZONE=Asia/Kolkata`

### Must calculate per ticket
- First response due time
- Resolution due time
- First response SLA state
- Resolution SLA state
- Remaining business time

**Worked example:** HIGH priority, created Friday 17:00, first-response target 4 business hours →
Fri 17:00–18:00 = 1h, Sat/Sun = 0h, Mon 09:00–12:00 = 3h → **due Monday 12:00**.

### SLA states
- `ON_TRACK`: 0–75% of SLA budget consumed
- `AT_RISK`: >75% of budget consumed
- `BREACHED`: deadline has passed
- Document exact 75% boundary behavior (e.g. is exactly 75% ON_TRACK or AT_RISK?) in README.

### Clock freezing
Once an SLA event actually happens, its clock stops permanently — store `firstResponseAt` / `resolvedAt` and never let a completed SLA become BREACHED later.

### First response definition
The first comment made by someone **other than the reporter** counts as first response. Timestamp recorded as `firstResponseAt`; later comments never modify it.

### Remaining business time
```graphql
type SLAInfo {
  firstResponseDueAt: String!
  resolutionDueAt: String!
  firstResponseState: SLAState!
  resolutionState: SLAState!
  firstResponseRemainingMinutes: Int!
  resolutionRemainingMinutes: Int!
}
```
Frontend must NOT calculate SLA state itself — API is the source of truth.

## 9. Holiday Calendar
- `Holiday { id, date, name }`
- SLA engine must exclude holidays from business-hour calculations
- Example: Friday 17:00 → Monday is a holiday → next business period is Tuesday 09:00 (Monday contributes zero hours)

## 10. SLA Edge Cases (must be handled + tested)
- Created before business hours (e.g. Mon 07:00) → SLA counting starts Mon 09:00
- Created after business hours (e.g. Mon 20:00) → starts Tue 09:00
- Created Friday 17:59 → only 1 minute counts before weekend
- Created Saturday/Sunday → counting starts next business period
- Monday holiday → next business period is Tuesday

## 11. Timezones
- Store timestamps in UTC
- API timestamps in unambiguous format (ISO 8601)
- Business hours use configured business timezone (env var `BUSINESS_TIMEZONE`)
- Frontend displays timestamps in user's local timezone
- SLA calculations must correctly handle the configured timezone

## 12. Pagination & Filtering
- Cursor-based pagination for ticket listing
```graphql
type TicketConnection { nodes: [Ticket!]! pageInfo: PageInfo! }
type PageInfo { hasNextPage: Boolean! endCursor: String }
```
- Filterable by status, priority, assignee, SLA state

## 13. Dashboard
```graphql
type TicketDashboard {
  openTickets: Int!
  inProgressTickets: Int!
  atRiskTickets: Int!
  breachedTickets: Int!
}
```
Frontend displays these stats.

## 14. Frontend (React + TypeScript, Next.js optional)
Must: display ticket list w/ priority, status, assignee, SLA state, remaining SLA time; filter; sort; create tickets; view ticket details; display + add comments; assign tickets; change status; resolve tickets; display dashboard stats; clearly display validation/authorization errors.
UI doesn't need to be visually elaborate — correctness and usability are the focus.

## 15. Backend-Driven SLA State
Frontend must never independently compute SLA state (e.g. "75% consumed → AT_RISK") — it only renders what the API returns (`firstResponseState`, `firstResponseRemainingMinutes`, etc.).

## 16. Tests (required)

### Unit tests — SLA/business-hours engine, at minimum:
- Normal weekday calculation
- Created before business hours
- Created after business hours
- Weekend
- Friday evening
- Public holiday
- Weekend + holiday combination
- SLA crossing multiple business days
- First-response SLA
- Resolution SLA
- SLA becoming AT_RISK
- SLA becoming BREACHED
- Completed SLA remaining completed (frozen clock)

### Also unit test:
Ticket creation, invalid ticket validation, status transitions, assignment, first-response recording, comment creation, authorization.

### Integration test
At least one against a **real** Dockerized Postgres (no mocking). Suggested flow: create ticket → add reporter comment → add agent comment → verify `firstResponseAt` → verify persisted SLA info.

## 17. Error Handling
All expected business errors → proper GraphQL errors with the codes listed in section 6. No unhandled 500s for validation failures.

## 18. Project Structure (suggested)
```
src/
  graphql/
    schema/
    resolvers/
  services/
    ticket/
    sla/
    auth/
  repositories/
  validation/
  auth/
  db/
  server.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/
  unit/
  integration/
```
SLA/business-hours calculation isolated into its own service/module — never directly inside resolvers.

## 19. Environment Configuration
No secrets committed. Env vars: `DATABASE_URL`, `JWT_SECRET`, `BUSINESS_TIMEZONE`. Provide `.env.example`.

## 20. Seed Data
Example:
- Users: `reporter@example.com`, `agent@example.com`
- Tickets: one each of URGENT/HIGH/MEDIUM/LOW
- Holidays: at least one sample holiday
Document seed credentials in README if relevant.

## 21. README (required content)
Project overview · tech stack · architecture overview · database schema overview · SLA calculation approach · status transition rules · authentication approach · environment variables · setup instructions · migration instructions · seed instructions · how to run backend · how to run frontend · how to run tests · example GraphQL queries/mutations.

Target setup flow (as close as possible):
```
docker compose up -d && bun install && bun run gendb && bun run dev
```
If frontend/backend need separate processes, document exact commands.

Also include: **"How I'd extend this"** — e.g. SLA pause while waiting for customer, escalation rules, notifications, per-team calendars, audit logs, agent performance metrics, recurring holidays, more sophisticated SLA policies.

## 22. Git / GitHub
- Incremental commits with meaningful messages (not "update"/"final"/"done")
  - Good examples: `feat: add ticket and user models`, `feat: implement GraphQL ticket queries`, `feat: add business hours SLA calculator`, `test: cover holiday and weekend SLA calculations`
- Open a PR against your own `main`
- PR description: implementation summary, architecture decisions, SLA calculation approach, tradeoffs, known limitations, what you'd improve with more time

## 23. Bonus (optional)
Dockerized app, DB-level constraints, SLA pause while `WAITING_ON_CUSTOMER`, audit trail for status/assignee changes, SLA escalation notifications, email notifications, per-team business calendars, multiple timezones, agent performance stats, live-updating countdown, e2e tests, CI pipeline, rate limiting, observability/logging.

## Submission
1. Git repository URL
2. Pull Request URL
3. README (setup + architecture docs)
4. 5–10 min walkthrough (written or screen recording) covering: architecture, GraphQL schema, DB schema, SLA calculation approach, business-hours handling, timezone handling, status transition design, testing strategy, tradeoffs.

---

# Execution Plan

11 phases, sequenced so nothing downstream is built on top of untested logic. Each phase lists its tasks, a suggested commit, and what "done" looks like before moving on.

---

### Phase 0 — Repo & Tooling Setup
**Goal:** a clean, strict, lint-enforced foundation before any feature code.

- [ ] Init monorepo: `backend/`, `frontend/` (bun workspaces or plain folders)
- [ ] TypeScript strict mode in both packages
- [ ] ESLint config with `no-explicit-any` enforced
- [ ] Prettier config
- [ ] `docker-compose.yml` for Postgres
- [ ] `.env.example` with `DATABASE_URL`, `JWT_SECRET`, `BUSINESS_TIMEZONE`

**Commit:** `chore: scaffold project structure`
**Done when:** `docker compose up -d` starts Postgres, `bun install` succeeds in both packages, lint runs clean on an empty project.

---

### Phase 1 — Database Schema
**Goal:** every model the rest of the app depends on, migrated and indexed.

- [ ] Define `User`, `Ticket`, `Comment`, `Holiday` models in `prisma/schema.prisma`
- [ ] Define enums: `Priority`, `TicketStatus`, `UserRole`, `SLAState`
- [ ] Add relations: reporter/assignee on `Ticket`, author/ticket on `Comment`
- [ ] Add indexes on `status`, `priority`, `assigneeId`
- [ ] Run `prisma migrate dev`, commit generated migration files
- [ ] Write `prisma/seed.ts` stub (fill in later, in Phase 10)

**Commit:** `feat: add ticket, user, comment, and holiday models`
**Done when:** migration applies cleanly to a fresh DB; Prisma Client generates without errors.

---

### Phase 2 — SLA Engine Core (business-hours math)
**Goal:** the single highest-weighted piece of the assignment, built and proven correct in complete isolation — no Prisma, no GraphQL imports.

- [ ] Write `snapToNextBusinessMoment(datetime, holidays)` — handles before-hours, after-hours, weekend, and holiday snapping
- [ ] Write `addBusinessMinutes(start, minutesNeeded, holidays)` using the snap function
- [ ] Unit test every edge case *before* writing downstream code:
  - [ ] Normal weekday calculation
  - [ ] Created before business hours
  - [ ] Created after business hours
  - [ ] Friday evening (one minute before weekend)
  - [ ] Weekend
  - [ ] Public holiday
  - [ ] Weekend + holiday combination
  - [ ] SLA crossing multiple business days

**Commit:** `feat: add business hours SLA calculator`
**Done when:** all edge-case tests pass with no downstream code depending on this module yet.

---

### Phase 3 — SLA State & Remaining Time
**Goal:** layer state (ON_TRACK / AT_RISK / BREACHED) and countdown on top of Phase 2, still pure and isolated.

- [ ] Write `getSLARemainingMinutes(now, dueAt, holidays)` reusing the Phase 2 day-walk logic
- [ ] Write `getSLAState(elapsedBusinessMinutes, totalBudgetMinutes, now, dueAt)` — document the 75% boundary rule explicitly (e.g. exactly 75% = ON_TRACK)
- [ ] Write `computeSLAInfo(ticket, policy, holidays)` — the single entry point resolvers will call, producing due dates + state + remaining minutes for both first response and resolution
- [ ] Unit tests:
  - [ ] First-response SLA calculation
  - [ ] Resolution SLA calculation
  - [ ] Transitions to AT_RISK correctly
  - [ ] Transitions to BREACHED correctly
  - [ ] A completed SLA (frozen via `firstResponseAt`/`resolvedAt`) never later shows BREACHED

**Commit:** `feat: add SLA state and remaining-time calculation`
**Done when:** `computeSLAInfo` is the only function the rest of the app will ever call for SLA data.

---

### Phase 4 — Authentication
**Goal:** secure registration/login and a reusable authorization layer.

- [ ] Password hashing with bcrypt or Argon2
- [ ] `register` / `login` logic issuing JWTs
- [ ] GraphQL context function decoding JWT → typed `currentUser`
- [ ] `requireAuth()` / `requireAgent()` helper guards for resolvers
- [ ] Decide and document: can anyone register as AGENT, or is it restricted?

**Commit:** `feat: implement authentication and password hashing`
**Done when:** register + login work end-to-end and return a usable token; unauth'd requests are rejected server-side.

---

### Phase 5 — GraphQL Schema-First Setup
**Goal:** the API contract, defined before resolver logic.

- [ ] Write `.graphql` SDL files for all types, enums, queries, mutations from the spec
- [ ] Wire GraphQL Yoga to load the SDL
- [ ] Set up `graphql-codegen` so resolver types are generated (keeps `any` out)
- [ ] Stub every resolver (returns not-implemented) to confirm the schema compiles end-to-end

**Commit:** `feat: implement GraphQL schema and resolver stubs`
**Done when:** the GraphQL Playground/Yoga UI shows the full schema and every query/mutation is queryable (even if unimplemented).

---

### Phase 6 — Ticket & Comment Business Logic
**Goal:** real resolver behavior, calling into services — not embedding logic inline.

- [ ] `createTicket` with validation (empty title/description, invalid priority)
- [ ] `changeTicketStatus` with a transition-rule table, unit tested independently of GraphQL
- [ ] `assignTicket` (validates assignee exists, agent-only)
- [ ] `addComment` — implements "first non-reporter comment sets `firstResponseAt`"
- [ ] `resolveTicket` — sets `resolvedAt`, freezes resolution SLA
- [ ] Map every validation/authorization failure to its GraphQL error code (`VALIDATION_ERROR`, `TICKET_NOT_FOUND`, `USER_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_STATUS_TRANSITION`, `INVALID_PRIORITY`, `INVALID_COMMENT`)
- [ ] Unit tests: ticket creation, invalid input rejection, status transitions, assignment, first-response recording, comment creation, authorization checks

**Commit:** `feat: implement ticket status transitions` (+ separate commits per mutation as needed)
**Done when:** every mutation in the spec works against a real DB and rejects invalid input with the correct error code instead of a 500.

---

### Phase 7 — Queries: Dashboard, Pagination, Filtering
**Goal:** read-side API completeness.

- [ ] `tickets()` with cursor-based pagination (`take`, `cursor`, `pageInfo`)
- [ ] Filters: status, priority, assigneeId, slaState
- [ ] `ticket(id)` single lookup
- [ ] `dashboard` aggregate query (open / in-progress / at-risk / breached counts)
- [ ] `users(role)`, `holidays` queries

**Commit:** `feat: add ticket dashboard` (+ `feat: implement GraphQL ticket queries`)
**Done when:** filtering and pagination behave correctly against a seeded dataset spanning multiple SLA states.

---

### Phase 8 — Integration Test
**Goal:** prove the full stack works against a real Postgres instance, not mocks.

- [ ] Docker-based test DB setup/teardown
- [ ] Test flow: create ticket → add reporter comment → add agent comment → verify `firstResponseAt` set correctly → verify persisted SLA info matches expectations

**Commit:** `test: cover holiday and weekend SLA calculations` (or a dedicated integration-test commit)
**Done when:** the integration test passes against the actual Dockerized Postgres, no mocking of the persistence layer.

---

### Phase 9 — Frontend
**Goal:** a usable UI that trusts the backend as the single source of truth for SLA state.

- [ ] Ticket list: priority, status, assignee, SLA state, remaining time
- [ ] Filter + sort controls
- [ ] Create-ticket form
- [ ] Ticket detail view with comment thread + add-comment
- [ ] Assign ticket / change status / resolve ticket actions
- [ ] Dashboard stat cards
- [ ] Clear display of validation and authorization errors returned by the API
- [ ] Confirm the frontend never recomputes SLA state itself — only renders API values

**Commit:** `feat: build ticket list and dashboard UI` (+ incremental commits per screen)
**Done when:** a user can complete the full flow — register/login, create a ticket, comment, assign, transition status, resolve — entirely through the UI.

---

### Phase 10 — Seed Data, README, Docs
**Goal:** a reviewer can clone, run, and understand the project in minutes.

- [ ] Fill in `prisma/seed.ts`: `reporter@example.com`, `agent@example.com`, one ticket per priority, at least one holiday
- [ ] Write README: overview, tech stack, architecture, DB schema, SLA approach, transition rules, auth approach, env vars, setup/migration/seed instructions, how to run backend/frontend/tests, example queries/mutations
- [ ] Write "How I'd extend this" section
- [ ] Verify the documented setup flow actually works from a clean clone

**Commit:** `docs: add setup and architecture documentation`
**Done when:** `docker compose up -d && bun install && bun run gendb && bun run dev` (or your documented equivalent) works from scratch.

---

### Phase 11 — Submission Prep
**Goal:** a clean, reviewable PR.

- [ ] Confirm commit history is incremental and descriptively messaged (no "update"/"final"/"done")
- [ ] Open PR against your own `main`
- [ ] PR description: implementation summary, architecture decisions, SLA calculation approach, tradeoffs, known limitations, what you'd improve with more time
- [ ] Record/write the 5–10 minute walkthrough covering architecture, GraphQL schema, DB schema, SLA approach, business-hours handling, timezone handling, status transition design, testing strategy, tradeoffs
- [ ] Gather the 4 submission items: repo URL, PR URL, README, walkthrough

**Done when:** all 4 submission items are ready to send.

---

## Key implementation note: business-hours algorithm
```
function addBusinessMinutes(start, minutesNeeded, holidays):
  cursor = snapToNextBusinessMoment(start, holidays)
  while minutesNeeded > 0:
    dayEnd = endOfBusinessDay(cursor)          # 18:00 same day
    availableToday = minutesBetween(cursor, dayEnd)
    if availableToday >= minutesNeeded:
      return cursor + minutesNeeded
    minutesNeeded -= availableToday
    cursor = snapToNextBusinessMoment(startOfNextDay(cursor), holidays)
```
`snapToNextBusinessMoment` handles: before 09:00 → snap to 09:00 same day; after 18:00 → snap to 09:00 next business day; Sat/Sun → snap to Monday 09:00; holiday → skip to next non-holiday weekday 09:00. Get this one function's unit tests green first — every SLA edge case reduces to it being correct. For "remaining business minutes," reuse the same day-by-day walk (now → dueAt) rather than a separate calculation path.
