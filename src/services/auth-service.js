import jwt from 'jsonwebtoken';
import crypto from "crypto";
import bcrypt from 'bcrypt';
import { HttpError } from '../utils/error-utils.js';
import { createUser, getUser, getUserByToken, updateUser } from '../data/user-repository.js';
import { activate, deactivate, isActive } from '../data/active-token-store.js';

const secretKey = process.env.JWT_SECRET;

/**
 * Check that the token passed is of the correct type and is a valid jwt token.
 * @param {string} token - The jwt token to be passed.
 * @param {"access" | "refresh"} typeRequired - The type of token required.
 * @throws {HttpError} If the token is invalid.
 */
export async function verifyToken(token, typeRequired) {
  try {
    const decoded = jwt.verify(token, secretKey);
    // ensure that refresh tokens are only used for refreshing
    // and access tokens are only used for authentication
    if (decoded.type !== typeRequired) {
      throw new HttpError('invalid token', 403);
    }
    // access tokens must be the latest token created
    if (decoded.type === 'access' && !(await isActive(decoded.id, token))) {
      throw new HttpError('invalid token', 403);
    }
    return decoded;
  } catch (err) {
    switch (err.name) {
      case 'TokenExpiredError':
        throw new HttpError('expired token', 401)
      case 'JsonWebTokenError':
        throw new HttpError('invalid token', 401)
      default:
        throw err;
    }
  }
}

/**
 * Generates access and refresh tokens
 * @param {number} id - User ID
 * @returns {{token: string, refreshToken: string}}
 */
function generateTokens(id) {
  const token = jwt.sign({ id, type: 'access', jti: crypto.randomUUID(), }, secretKey, {expiresIn: '1h'});
  const refreshToken = jwt.sign({ id, type: 'refresh', jti: crypto.randomUUID(), }, secretKey, { expiresIn: '30d'});
  return { token, refreshToken };
}

/**
 * Authenticate the user.
 * @param {string} username - User's username.
 * @param {string} password - User's password.
 * @throws {HttpError} If the token is invalid.
 */
export async function checkCredentials(username, password) {
  const user = await getUser(username);
  // ensure the user exists
  if (!user) {
    throw new HttpError('invalid username', 401);
  }
  // check if the passwords match
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new HttpError('invalid password', 401);
  }
  // generate the necessary tokens and ensure the access token is the current active token
  const { token, refreshToken } = generateTokens(user.id);
  await activate(user.id, token);
  // update the refresh token(revoking the old one as a result)
  await updateUser(username, user.password, refreshToken, false);
  return {
    id: user.id,
    token,
    refreshToken,
    message: 'successful'
  }
}

/**
  * Hash the password.
  * @param {string} password - User's password.
  */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Validate and sign on a new user.
 * @param {string} username - User's username.
 * @param {string} password - User's password.
 * @throws {HttpError} If the token is invalid.
 */
export async function createCredentials(username, password) {
  const userCheck = await getUser(username);
  // ensure the username is not taken
  if (userCheck) {
    throw new HttpError('username already exists', 409);
  }
  // NOTE: never forget to hash the password
  const hash = await hashPassword(password);
  const user = await createUser(username, hash, '');
  // generate new tokens and ensure the access token is the current active token
  const {token, refreshToken} = generateTokens(user.id);
  await activate(user.id, token);
  // revoke the old refreshToken by replacing with the latest one
  await updateUser(username, user.password, refreshToken, false);
  return { 
    token,
    refreshToken,
    id: user.id,
    message: "successful registration" 
  };
}

/**
 * Validate and refresh the long term refresh token.
 * @param {string} refreshTkn - User's refresh token.
 * @throws {HttpError} If the token is invalid.
 */
export async function refreshToken(refreshTkn) {
  const user = await getUserByToken(refreshTkn);
  // check that a user owns the refresh token, the token is not revoked(by the logout controller)
  // and that it is the most active token(also meaning it is not revoked)
  if (user === null || user.isRevoked || user.refreshToken !== refreshTkn) {
    throw new HttpError('invalid token', 401);
  }
  await verifyToken(refreshTkn, 'refresh');
  // generate fresh tokens. Ensure you make the current access token the active one
  const { token, refreshToken} = generateTokens(user.id);
  await activate(user.id, token);
  // update the refresh token for the user
  await updateUser(user.username, user.password, refreshToken, false);
  return { 
    token,
    refreshToken,
    id: user.id,
    message: "successful token refresh" 
  };
}

/**
 * Revoke a user's refresh token.
 * @param {string} refreshToken - User's logout refresh token.
 * @throws {HttpError} If the token is invalid.
 */
export async function revokeToken(refreshToken) {
  const user = await getUserByToken(refreshToken);
  // if the token points to no user, inform the user about it
  if (user) {
    // deactivate the current active token. Ensure the refreshToken is revoked
    await deactivate(user.id);
    await updateUser(user.username, user.password, 'revoked', true);
    return {
      id: user.id,
      message: "successful logout",
    }
  } else {
    throw new HttpError('invalid token', 400);
  }
}
