import { createClient } from '@libsql/client';

export function getDB() {
  return createClient({
    url:       process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function ensureTables(db) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS customers (
      site_id  TEXT PRIMARY KEY,
      data     TEXT NOT NULL,
      sort_ts  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS history (
      id   TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      ts   TEXT DEFAULT (datetime('now'))
    );
  `);
}
