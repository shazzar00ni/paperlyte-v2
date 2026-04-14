# Decisions

This file tracks key architectural, design, and technical decisions made during development.

## Format

- **Date**: YYYY-MM-DD
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Alternatives considered**: What else was considered

---

<!-- Log decisions below -->

## 2026-04-14 — Neon Postgres for waitlist storage

- **Decision**: Use Neon serverless Postgres to persist waitlist emails, replacing the previous ConvertKit integration in `netlify/functions/subscribe.ts`.
- **Rationale**: User provided a Neon connection string; direct DB storage gives full ownership of the data without a third-party dependency.
- **Connection**: Stored in `DATABASE_URL` env var (never hardcoded). Pooled endpoint used for serverless compatibility.
- **Schema**: Single `waitlist` table with `id`, `email` (UNIQUE), `created_at`, `ip_hash` (truncated SHA-256, not raw IP), `source`.
- **Migration**: Run `npm run db:migrate` (requires `DATABASE_URL` in env) to create the table.
- **Alternatives considered**: Keeping ConvertKit alongside Neon (rejected — unnecessary complexity at this stage).
