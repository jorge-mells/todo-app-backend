import logger from '../utils/logger.js';
import { verifyToken } from '../services/auth-service.js';
import { errorHandler } from '../utils/error-utils.js';

export const authenticate = async (req, res, next) => {
  const authAttempt = {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  try {
    const decoded = await verifyToken(token, 'access')
    req.user = decoded;
    authAttempt.id = decoded.id;
    logger.info("authentication attempt: successful", authAttempt);
    next();
  } catch (err) {
    return errorHandler(req, res, err, 'authentication attempt');
  }
}
