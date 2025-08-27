import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis;

/**
 * @type PrismaClient
 */
const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;
