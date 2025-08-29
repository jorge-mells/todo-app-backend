/**
 * Seeds the database with initial data.
 * @param {import('@prisma/client').PrismaClient} db - The PrismaClient instance.
 */
const genericSeedData = async (db, log) => {
    log.test = await db.tag.create({
    data: { name: 'test' },
  })

  log.prod = await db.tag.create({
    data: { name: 'prod' },
  })

  log.staging = await db.tag.create({
    data: { name: 'staging' },
  })

  log.feature = await db.tag.create({
    data: { name: 'feature' },
  })

  log.scratch = await db.tag.create({
    data: { name: 'scratch' },
  })

  const includeQuery = {
    tags: {
      select: {
        tag: true,
      },
    },
  };

  log.database = await db.todo.create({
    data: {
      user: { connect: { username: 'alice' } },
      title: 'database', content: 'create the database', status: 'IN_PROGRESS',
      tags: {
        create: [
          {
            tag: {
              connect: { name: "test" }
            }
          },
          {
            tag: {
              connect: { name: "prod" }
            }
          }
        ]
      }
    },
    include: includeQuery,
  })

  log.orm = await db.todo.create({
    data: {
      user: { connect: { username: 'alice' } },
      title: 'orm', content: 'choose an orm and connect to the database', status: 'IN_PROGRESS',
      tags: {
        create: [
          {
            tag: {
              connect: { name: "staging" }
            }
          },
          {
            tag: {
              connect: { name: "prod" }
            }
          }
        ]
      }
    },
    include: includeQuery,
  })

  log.services = await db.todo.create({
    data: {
      user: { connect: { username: 'bob' } },
      title: 'services', content: 'write the service methods to interact with methods of the orm', status: 'COMPLETED',
      tags: {
        create: [
          {
            tag: {
              connect: { name: "staging" }
            }
          },
          {
            tag: {
              connect: { name: "feature" }
            }
          }
        ]
      }
    },
    include: includeQuery,
  })

  log.routes = await db.todo.create({
    data: {
      user: { connect: { username: 'bob' } },
      title: 'routes', content: 'define the routes appropriately', status: 'CANCELLED',
      tags: {
        create: [
          {
            tag: {
              connect: { name: "scratch" }
            }
          },
          {
            tag: {
              connect: { name: "feature" }
            }
          }
        ]
      }
    },
    include: includeQuery,
  })
  return log;
}
/**
 * Seeds the database with initial data.
 * @param {import('@prisma/client').PrismaClient} db - The PrismaClient instance.
 */
export async function seedDataSimple(db) {
  const log = {};
  log.alice = await db.user.create({
    data: { username: 'alice', password: 'alice', refreshToken: 'alice' },
  })

  log.bob = await db.user.create({
    data: { username: 'bob', password: 'bob', refreshToken: 'bob' },
  })

  const generic = await genericSeedData(db, {});

  return { ...log, ...generic };
}

export async function seedDataE2E(db) {
  const log = {};
  log.alice = await db.user.create({
    // actual password: _pa5ss1w$od*rd/
    data: { username: 'alice', password: '$2b$10$iGgi5UvC3z.614/N6dZkNeOc7fYMZGtHNam7/taoaMES4OCuNjlfa', refreshToken: '' },
  })

  log.bob = await db.user.create({
    // actual password: =MfKHfgB&f@c&OLz
    data: { username: 'bob', password: '$2b$10$hmF4dDAkqn07NmSvOnsu/u4KKxYEWL0eR2uGk2LKLQGDc3uu3DuDS', refreshToken: '' },
  })

  const generic = await genericSeedData(db, {});

  return { ...log, ...generic };
}
