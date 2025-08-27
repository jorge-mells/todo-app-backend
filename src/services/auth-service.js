import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcrypt';
import passwordChecker from 'zxcvbn';
import { HttpError } from '../utils/error-utils.js';
import { createUser, getUser, getUserByToken, updateUser } from '../data/user-repository.js';
import { activate, deactivate, isActive } from '../data/active-token-store.js';

const secretKey = process.env.JWT_SECRET;

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

function generateTokens(id) {
  const token = jwt.sign({ id, type: 'access' }, secretKey, {expiresIn: '1h'});
  const refreshToken = jwt.sign({ id, type: 'refresh' }, secretKey, { expiresIn: '30d'});
  return { token, refreshToken };
}

export async function checkCredentials(username, password) {
  const user = await getUser(username || '');
  // ensure the user exists
  if (!user) {
    throw new HttpError('invalid username', 401);
  }
  // check if the passwords match
  const isValid = await bcrypt.compare(password || '', user.password);
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

async function validateCredentials(username, password) {
  const user = await getUser(username);
  // ensure the username is not taken
  if (user) {
    throw new HttpError('username already exists', 409);
  // ensure the username has the correct format
  } else if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,18}[a-zA-Z0-9]$/.test(username)) {
    throw new HttpError('invalid username: username should start with a letter or number, and should only contain letters, numbers, -, and _', 400);
  }

  // ensure the user picks a strong password
  const passwordCheck = passwordChecker(password);
  if (passwordCheck.score < 3) {
    throw new HttpError(`invalid password: ${passwordCheck.feedback.suggestions.join(' ')}`, 400);
  } 
  return;
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function createCredentials(username, password) {
  // check that the user has picked the correct username and password
  await validateCredentials(username, password);
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

export async function revokeToken(token) {
  const user = await getUserByToken(token);
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
