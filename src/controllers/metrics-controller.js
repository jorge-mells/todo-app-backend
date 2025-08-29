import { register } from '../utils/metrics.js'

/**
 * @import { Request, Response } from 'express'
 */

/**
 * Validate and authenticate the user.
 * @param {Request} _req - Express request object.
 * @param {Response} res - Express response object.
 */
export const sendMetrics = async (_req, res) => {
	try {
		res.set('Content-Type', register.contentType);
		return res.end(await register.metrics());
	} catch (ex) {
		return res.status(500).end(ex);
	}
};

