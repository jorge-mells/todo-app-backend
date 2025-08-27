import { createCredentials, checkCredentials, refreshToken, revokeToken } from '../services/auth-service.js';
import { errorHandler } from '../utils/error-utils.js';
import { requestHandler } from '../utils/helpers.js';

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await createCredentials(username, password);
    return requestHandler(req, res, result, 201);
  } catch (err) {
    return errorHandler(req, res, err, 'registration attempt');
  }
}


export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await checkCredentials(username, password);
    return requestHandler(req, res, result, 200);
  } catch (err) {
    return errorHandler(req, res, err, 'login attempt');
  }
};

export const refresh = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  try {
    const result = await refreshToken(token);
    return requestHandler(req, res, result, 200);
  } catch (err) {
    return errorHandler(req, res, err, 'refresh attempt');
  }
}

export const logout = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  try {
    const result = await revokeToken(token);
    return requestHandler(req, res, result, 200);
  } catch (err) {
    return errorHandler(req, res, err, 'logout attempt');
  }
}
