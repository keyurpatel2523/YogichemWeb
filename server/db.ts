import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

const globalForPg = globalThis as unknown as {
  pgPool?: pg.Pool;
  drizzleDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
  }

  const sslConfig = connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined;

  return new Pool({
    connectionString,
    ssl: sslConfig,
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });
}

export function getPool() {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = createPool();
  }
  return globalForPg.pgPool;
}

function getDb() {
  if (!globalForPg.drizzleDb) {
    globalForPg.drizzleDb = drizzle(getPool(), { schema });
  }
  return globalForPg.drizzleDb;
}

type Database = ReturnType<typeof getDb>;

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    const real = getDb();
    const value = Reflect.get(real, property, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export const pool = new Proxy({} as pg.Pool, {
  get(_target, property, receiver) {
    const real = getPool();
    const value = Reflect.get(real, property, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
