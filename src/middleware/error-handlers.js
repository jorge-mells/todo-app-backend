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
  if (err instanceof SyntaxError && 'body' in err) {
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
 * @param {any} err - An error of any type.
 * @param {Request} _req - Express request object.
 * @param {Response} res - Express response object.
 */
export const handleAllOtherErrors = (err, _req, res) => {
  if (err?.code === 'P2025') {
    return res.status(400).json({
      message: 'resource does not exist',
    })
  }
  return res.status(500).send({ 
    message: 'internal server error: please contact the developers',
    docs: "You can check the api documentation at /api/v1/api-docs"
 });
};
