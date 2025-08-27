import logger from "./logger.js";

export function errorMessage(err) {
  const client = 'internal server error: please contact the developers'
  if (err instanceof HttpError) return { log: err.message, client: err.message, stack: err.stack };
  if (err instanceof Error) return { log: err.message, client, stack: err.stack };
  if (typeof err === 'string') return { log: err, client, stack: '' };
  return { log: `Non error: ${String(err)}`, client, stack: '' };
}

export function statusCode(err) {
  if (err instanceof HttpError) return err.statusCode;
  return 500;
}

export function errorHandler(req, res, err, errorPrefix) {
  const connectionAttempt = {
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  const message = errorMessage(err);
  connectionAttempt.stack = message.stack;
  logger.error(`${errorPrefix}: ${message.log}`, connectionAttempt);
  return res.status(statusCode(err)).json({
    error: message.client,
  })
}

// please ensure you insert a user friendly message when using this error
export class HttpError extends Error {
  constructor(message, statusCode) {
    super(message); 
    this.name = 'HttpError'; 
    this.statusCode = statusCode; 
  }
}
