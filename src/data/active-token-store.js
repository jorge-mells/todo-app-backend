import { createClient } from 'redis';

const client = createClient();

await client.connect();

export async function activate(id, token) {
  await client.set(String(id), token);
}

export async function isActive(id, token) {
  const activeToken = await client.get(String(id));
  return activeToken === token;
}

export async function deactivate(id) {
  await client.del(String(id));
}

