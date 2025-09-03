
/**
 * @import { Request, Response } from 'express'
 */

import logger from '../utils/logger.js';

/**
 * Validate and authenticate the user.
 * @param {Request} _req - Express request object.
 * @param {Response} res - Express response object.
 */
export const healthz = (_req, res) => {
	logger.info("server is healthy");
  res.status(200).json({
    message: "successful"
  })
};
