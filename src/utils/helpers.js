import logger from "./logger.js";

export function requestHandler(req, res, result, statusCode) {
  const requestAttempt = {
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  };
  requestAttempt.id = result.id;
  logger.info(`registration attempt: ${result.message}`, requestAttempt)
  return res.status(statusCode).json(result);
}

export function makeArray(input) {
  if (!input) {
    return [];
  } else if (Array.isArray(input)) {
    return input;
  } else {
    return [input];
  }
}

export function isValidStatus(status) {
  let validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  return validStatuses.includes(status.toUpperCase());
}

