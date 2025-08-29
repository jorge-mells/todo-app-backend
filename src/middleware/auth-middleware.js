import validator from 'validator';
import logger from '../utils/logger.js';
import { verifyToken } from '../services/auth-service.js';
import { errorHandler } from '../utils/error-utils.js';
import { validate, tokenSchema } from '../utils/validators.js'

/**
 * @import { Request, Response, NextFunction } from 'express'
 */

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function param.
 */
export const authenticate = async (req, res, next) => {
  const authAttempt = {
    ip: validator.escape(req.ip || ''),
    userAgent: validator.escape(req.get('user-agent') || ''),
  };
  try {
    const authHeader = validate(tokenSchema, req.headers['authorization']);
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = await verifyToken(token, 'access')
    req.user = decoded;
    authAttempt.id = decoded.id;
    logger.info("authentication attempt: successful", authAttempt);
    return next();
  } catch (err) {
    return errorHandler(req, res, err, 'authentication attempt');
  }
}
