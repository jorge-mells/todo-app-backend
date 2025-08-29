import { expect, afterAll, beforeAll, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { seedDataE2E } from './seed.js';
import db from '../src/data/db.js';
import { resetDB } from '../src/utils/helpers.js';

let server;
let agent;
let authTokens = {}
let seed;

describe('Test Auth Flow', function() {
  let credentials = {
    username: 'newuser',
    password: '}str#ong$pas*swo%rd',
  };
  beforeAll(async () => {
    await resetDB(db);
    server = app.listen(3002);
    agent = request.agent(server);
  })

  afterAll(async () => {
    await server.close();
  })

  it('tests user registration', async function() {
    const res = await request(app)
    .post('/api/v1/register')
    .set('Accept', 'application/json')
    .send(credentials)
    .expect('Content-Type', /json/)
    .expect(201);
    setTimeout(() => {}, 5000);
    authTokens.token = res.body.token;
    authTokens.refresh = res.body.refreshToken;
  });

  it ('tests proper use of access tokens', async function() {
    await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  })
  it ('tests improper use of access tokens', async function() {
    await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${authTokens.refresh}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403);
  })
  it ('tests login', async function() {
    const result = await request(app)
      .post('/api/v1/login')
      .set('Accept', 'application/json')
      .send(credentials)
      .expect('Content-Type', /json/)
      .expect(200);
    authTokens.newToken = result.body.token;
    authTokens.newRefresh = result.body.refreshToken;
  })
  it ('tests validity of old tokens after fresh login', async function() {
    await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403);
    const res = await request(app)
      .post('/api/v1/refresh')
      .set('Authorization', `Bearer ${authTokens.refresh}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
    authTokens.token = res.body.token;
    authTokens.refresh = res.body.refreshToken;
  })
});

describe('Test CRUD functions', function() {
    beforeAll(async () => {
    await resetDB(db);
    seed = await seedDataE2E(db);
    server = app.listen(3002);
    agent = request.agent(server);
    const res = await agent.post('/api/v1/login').send({ username: 'alice', password: '_pa5ss1w$od*rd/' });
    authTokens.token = res.body.token;
    authTokens.refresh = res.body.refreshToken;
  })

  afterAll(() => {
    server.close();
  })

  it('tests getting a single todo', async () => {
    await request(app)
    .get('/api/v1/todos/1')
    .set('Authorization', `Bearer ${authTokens.token}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);
  });

  it('tests getting a filtered set of todos', async () => {
    const res = await request(app)
      .get('/api/v1/todos/')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .set('Accept', 'application/json')
      .query({
        tag: ['test', 'staging'],
        status: ['  in_progress  '],
      })
      .expect('Content-Type', /json/)
      .expect(200);
    const expectedDatabaseTodo = { ...seed.database };
    delete expectedDatabaseTodo.createdAt; delete expectedDatabaseTodo.updatedAt;
    const expectedOrmTodo = { ...seed.orm };
    delete expectedOrmTodo.createdAt; delete expectedOrmTodo.updatedAt;
    expect(res.body).toMatchObject({ message: "todos get query: successful", todos: [expectedDatabaseTodo, expectedOrmTodo] });
  })

})


