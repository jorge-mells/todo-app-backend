import { createClient } from 'redis';

// ensure the right database is used in testing.
let dbNumber = 0;
if (process.env.NODE_ENV === 'test') {
  dbNumber = 1 
}

const client = createClient({
  database: dbNumber,
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

await client.connect();

/**
 * Sets the access token for the given user as active, replacing the previous active token.
 * @param {number} id - The id of the user.
 * @param {string} token - The current active token of the user.
 */
export async function activate(id, token) {
  await client.set(String(id), token);
}

/**
 * Returns true if the token passed is the current active token.
 * @param {number} id - The id of the user.
 * @param {string} token - The token to be checked.
 */
export async function isActive(id, token) {
  const activeToken = await client.get(String(id));
  return activeToken === token;
}

/**
 * Unsets the access token for the given user.
 * @param {number} id - The id of the user.
 */
export async function deactivate(id) {
  await client.del(String(id));
}

