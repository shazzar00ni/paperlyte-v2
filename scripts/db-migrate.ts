/**
 * Database migration script for Paperlyte waitlist
 *
 * Creates the waitlist table in Neon if it doesn't already exist.
 *
 * Usage:
 *   DATABASE_URL=<your-neon-connection-string> npx tsx scripts/db-migrate.ts
 *
 * Requires DATABASE_URL environment variable to be set.
 */

import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set.')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function migrate() {
  console.log('Running database migration...')

  await sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id          SERIAL PRIMARY KEY,
      email       TEXT NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_hash     TEXT,
      source      TEXT DEFAULT 'website'
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC)
  `

  console.log('Migration complete: waitlist table is ready.')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
