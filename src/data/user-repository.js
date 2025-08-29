import db from "./db.js";

/**
 * Returns the user that matches the username.
 * @param {string} username - The username passed.
 */
export async function getUser(username) {
  const user = await db.user.findUnique({
    where: {
      username,
    }
  });
  return user;
};

/**
 * Returns the user that matches the refresh token.
 * @param {string} refreshToken - The refresh token passed.
 */
export async function getUserByToken(refreshToken) {
  const user = await db.user.findFirst({
    where: {
      refreshToken,
    }
  });
  return user;
}

/**
 * Returns a newly created and stored user.
 *
 * ⚠️ WARNING: Please make sure to pass a hashed password and a signed token to this method.
 *
 * @param {string} username - The username of the new user.
 * @param {string} password - The hashed password of the new user.
 * @param {string} refreshToken - The signed refresh token of the new user.
 */
export async function createUser(username, password, refreshToken) {
  const user = await db.user.create({
    data: {
      username,
      password,
      refreshToken
    }
  });
  return user;
}

/**
 * Returns the updated user.
 *
 * ⚠️ WARNING: Please make sure to pass a hashed password and a signed token to this method.
 *
 * @param {string} username - The username of the updated user.
 * @param {string} password - The hashed password of the updated user.
 * @param {string} refreshToken - The signed refresh token of the updated user.
 * @param {boolean} isRevoked - The new state of the refresh token to be passed.
 */
export async function updateUser(username, password, refreshToken, isRevoked) {
  const user = await db.user.update({
    where: {
      username,
    },
    data: {
      password,
      refreshToken,
      isRevoked,
    }
  });
  return user;
}
