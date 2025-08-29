import validator from 'validator';
import logger from "../utils/logger.js";

/**
 * @import { Request, Response, NextFunction } from 'express'
 */

/**
 * Validate and authenticate the user.
 * @param {any} err - An error of any type.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function param.
 */
export const handleSyntaxErrors = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error("invalid json", {
      ip: validator.escape(req.ip || 'Unknown'),
      userAgent: validator.escape(req.get('user-agent') || 'Unknown'),
    })
    return res.status(400).send({ message: 'The request body contains invalid JSON.' });
  }
  return next(err);
};

/**
 * Validate and authenticate the user.
 * @param {any} _err - An error of any type.
 * @param {Request} _req - Express request object.
 * @param {Response} res - Express response object.
 */
export const handleAllOtherErrors = (_err, _req, res) => {
  return res.status(500).send({ message: 'internal server error: please contact the developers' });
};
