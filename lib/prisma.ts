<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
=======
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { 
  prisma?: PrismaClient;
  pool?: Pool;
  adapter?: PrismaPg;
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({ 
    connectionString,
    max: 2, // Limit pool size per lambda to avoid EMAXCONNSESSION
    idleTimeoutMillis: 10000, // Close idle connections quickly
    connectionTimeoutMillis: 5000,
  });
}
const pool = globalForPrisma.pool;

if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = new PrismaPg(pool);
}
const adapter = globalForPrisma.adapter;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
>>>>>>> parent of 2fc54d9 (feat: implement core dashboard modules, mother and child data management, and offline-ready navigation structure)
