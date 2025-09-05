import { Prisma } from "@prisma/client";
import logger from "./logger.js";

/**
 * @import { Request, Response } from 'express'
 */

/**
 * Return an accurate error message for an error of unknown type.
 * @param {any} err - The unknown error object.
 * @returns {{ log: string, client: string, stack: string }} Returns three messages for logging, the client side and the
 * stack trace respectively.
 */
function errorMessage(err) {
  const client = 'internal server error: please contact the developers'
  if (err instanceof HttpError) return { log: err.message, client: err.message, stack: err.stack };
  if (err instanceof Error) return { log: err.message, client, stack: err.stack };
  if (typeof err === 'string') return { log: err, client, stack: '' };
  return { log: `Non error: ${String(err)}`, client, stack: '' };
}

/**
 * Return an accurate status code for an error of unknown type.
 * @param {any} err - The unknown error object.
 */
function statusCode(err) {
  if (err instanceof HttpError) return err.statusCode;
  return 500;
}

/**
 * Returns a properly formatted error message and status code for the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {any} err - The unknown error object.
 * @param {string} errorPrefix - A string prefix to prepend the error message.
 */
export function errorHandler(req, res, err, errorPrefix) {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003" 
  ) {
    return res.status(404).json({ error: "Resource not found" });
  }
  const connectionAttempt = {
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  const message = errorMessage(err);
  connectionAttempt.stack = message.stack;
  logger.error(`${errorPrefix}: ${message.log}`, connectionAttempt);
  return res.status(statusCode(err)).json({
    error: message.client,
    docs: "You can check the api documentation at /api/v1/api-docs"
  })
}

/**
 * Represents a properly formatted error with a user friendly message for the client.
 * NOTE: please ensure you insert a user friendly message when using this error
 *
 * @class
 * @extends Error
 */
export class HttpError extends Error {
  /**
   * @param {string} message - The user friendly client message.
   * @param {number} statusCode - An accurate status code for the error.
   */
  constructor(message, statusCode) {
    super(message); 
    this.name = 'HttpError'; 
    this.statusCode = statusCode; 
  }
}
