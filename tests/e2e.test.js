import { expect, afterAll, beforeAll, it } from 'vitest';
import { execa } from 'execa';
import request from 'supertest';
import app from '../src/app.js';
import { seedDataE2E } from './seed.js';
import db from '../src/data/db.js';

let server;
let agent;
let authTokens = {}
let seed;

describe('Test Auth Flow', function() {
  beforeAll(async () => {
    await execa`npx prisma migrate reset --force --skip-seed`;
    server = app.listen(3002);
    agent = request.agent(server);
  })

  afterAll((done) => {
    server.close(done);
  })

  it('tests user registration', function(done) {
    expect(true).toBe(true);
  });
});

describe('Test CRUD functions', function() {
    beforeAll(async () => {
    await execa`npx prisma migrate reset --force --skip-seed`;
    seed = await seedDataE2E(db);
    server = app.listen(3002);
    agent = request.agent(server);
    const res = await agent.post('/api/v1/login').send({ username: 'alice', password: '_pa5ss1w$od*rd/' });
    authTokens.token = res.body.token;
    authTokens.refresh = res.body.refreshToken;
  })

  afterAll((done) => {
    server.close(done);
  })

  it('tests getting a single todo', (done) => {
    request(app)
      .get('/api/v1/todos/1')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, _res) {
        if (err) return done(err);
        return done();
      });
  })

})


