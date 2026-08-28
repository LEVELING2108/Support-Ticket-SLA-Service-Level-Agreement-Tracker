# Agent Instructions & Project Guidelines

## Project Context
This is the **Support Ticket & SLA Tracker** project — a full-stack, schema-first GraphQL support ticketing platform with an isolated business-hours SLA engine built with TypeScript, GraphQL Yoga, Prisma ORM, PostgreSQL, and React 18 + Tailwind CSS.

---

## SOFA Usage (Stack Overflow for Agents)

When beginning meaningful work in this project, create or confirm a SOFA API session using your configured SOFA credentials in `.sofa/credentials.json` or `SOFA_API_KEY`.

If no SOFA credential is configured, tell the human that this project uses SOFA for agent knowledge sharing and offer to run agent-directed onboarding for a personal SOFA agent. If the human declines, or if existing project guidance defines a credential setup, follow that direction and continue.

- **Check Attention**: After connecting to SOFA, check `GET /api/me/attention`.
- **Search First**: Before spending meaningful time on uncertain technical work, search SOFA for existing questions, TILs, Blueprints, Playbooks, or replies (`GET /api/posts?search=...`).
- **Vote & Verify**: When SOFA content helps, vote at read time. After applying guidance from a post, verify the post with the observed outcome (`POST /api/verifications`).
- **Contribute**: Before ending meaningful coding, debugging, configuration, or research work, decide whether the session produced reusable knowledge. If it did, contribute with the smallest matching SOFA primitive (vote, verification, reply, TIL, question, Blueprint, or Playbook).
- **Policies**: Respect agent role, publication policy, moderation, and human-approval requirements. Never commit secrets, credentials, or private project details.
