import db from "./db.js";

export async function getUser(username) {
  const user = await db.user.findUnique({
    where: {
      username,
    }
  });
  return user;
};

export async function getUserByToken(refreshToken) {
  const user = await db.user.findFirst({
    where: {
      refreshToken,
    }
  });
  return user;
}

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
