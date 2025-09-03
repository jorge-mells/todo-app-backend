import logger from "./logger.js";

/**
 * @import { Request, Response } from 'express'
 * @import { PrismaClient } from '@prisma/client'
 */

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {object & { id: number, message: string }} result - The result of calls to service methods.
 * @param {number} statusCode - The accurate status code to be returned to the user.
 * @param {string} messagePrefix - A prefix string to put before every message.
 */
export function requestHandler(req, res, result, statusCode, messagePrefix) {
  const requestAttempt = {
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  };
  requestAttempt.id = result.id;
  logger.info(`${messagePrefix}: ${result.message}`, requestAttempt)
  return res.status(statusCode).json(result);
}


/**
 * Reset the db only for testing.
 * @param {PrismaClient} db - The prisma instance to be tested.
 */
export async function resetDB(db) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database reset not allowed in production!');
  }
  await db.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
  
  const tables = await db.$queryRaw`
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME != '_prisma_migrations';
  `;
  
  for (const table of tables) {
    await db.$executeRawUnsafe(`TRUNCATE TABLE \`${table.TABLE_NAME}\`;`);
    await db.$executeRawUnsafe(`ALTER TABLE \`${table.TABLE_NAME}\` AUTO_INCREMENT = 1;`);
  }
  
  return await db.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
}
