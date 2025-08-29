import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis;

/**
 * @type PrismaClient
 */

// ensure that only one client is used at any given point, especially when testing
const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

/**
 * The PrismaClient instance to be used throughout the app
 * @global
 */
export default db;
