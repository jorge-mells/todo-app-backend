import { createCredentials, checkCredentials, refreshToken, revokeToken } from '../services/auth-service.js';
import { errorHandler } from '../utils/error-utils.js';
import { requestHandler } from '../utils/helpers.js';
import { validate, authSchema, tokenSchema } from '../utils/validators.js';

/**
 * @import { Request, Response } from 'express'
 */

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const register = async (req, res) => {
  try {
    const { username, password } = validate(authSchema, req.body);
    const result = await createCredentials(username, password);
    return requestHandler(req, res, result, 201, 'registration attempt');
  } catch (err) {
    return errorHandler(req, res, err, 'registration attempt');
  }
}


/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const login = async (req, res) => {
  try {
    const { username, password } = validate(authSchema, req.body);
    const result = await checkCredentials(username, password);
    return requestHandler(req, res, result, 200, 'login attempt');
  } catch (err) {
    return errorHandler(req, res, err, 'login attempt');
  }
};

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const refresh = async (req, res) => {
  try {
    const authHeader = validate(tokenSchema, req.headers['authorization']);
    const token = authHeader && authHeader.split(' ')[1];
    const result = await refreshToken(token);
    return requestHandler(req, res, result, 200, 'refresh attempt');
  } catch (err) {
    return errorHandler(req, res, err, 'refresh attempt');
  }
}

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const logout = async (req, res) => {
  try {
    const authHeader = validate(tokenSchema, req.headers['authorization']);
    const token = authHeader && authHeader.split(' ')[1];
    const result = await revokeToken(token);
    return requestHandler(req, res, result, 200, 'logout attempt');
  } catch (err) {
    return errorHandler(req, res, err, 'logout attempt');
  }
}
