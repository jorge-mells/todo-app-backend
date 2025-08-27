import { beforeEach, expect, test, describe } from 'vitest';
import { execa } from 'execa';
import * as userRepository from '../src/data/user-repository.js';
import * as todoRepository from '../src/data/todo-repository.js';
import db from "../src/data/db.js";
import { seedDataSimple } from './seed.js';


let seed; 

beforeAll(async () => {
  await execa`npx prisma migrate reset --force --skip-seed`;
  seed = await seedDataSimple(db);
});

describe('User Repository Tests', () => {

  let expectedUser;

  beforeEach(() => {
    expectedUser = { id: 3, username: 'test', password: 'test', refreshToken: 'test', isRevoked: false };
  })

  test('createUser should return the generated user', async () => {
    const user = await userRepository.createUser(expectedUser.username, expectedUser.password, expectedUser.refreshToken);
    expect(user).toStrictEqual({ ...expectedUser});
  });

  test('getUser should return the user by username', async () => {
    const user = await userRepository.getUser('alice');
    expect(user).toStrictEqual(seed.alice);
  })

  test('getUserByToken should return the user found via refreshToken', async () => {
    const user = await userRepository.getUserByToken('bob');
    expect(user).toStrictEqual(seed.bob);
  })

  test('updateUser should return the updated user', async () => {
    expectedUser = {
      ...expectedUser,
      password: 'new password',
      refreshToken: 'refresh',
    }
    const user = await userRepository.updateUser('test', 'new password', 'refresh');
    expect(user).toStrictEqual({ ...expectedUser });
  })

})

describe('Todo Repository Tests', () => {
  let testTodo;
  let expectedTodo;

  beforeEach(() => {
    testTodo = { title: 'test', content: 'test todo', tags: ['test'], userId: 1 }
    expectedTodo = { ...testTodo, id: 5, tags: [ { tag: {name: 'test', id: 1 } } ], userId: 1, }
  })

  test('createTodo should return a new todo', async () => {
    const todo = await todoRepository.createTodo(testTodo);
    expect(todo).toMatchObject({ ...expectedTodo });
  })

  test('getTodo should return a todo of a user', async () => {
    const todo = await todoRepository.getTodo(1, 1);
    expect(todo).toStrictEqual(seed.database);
  })

  test('getAllTodos should return a todo of a user', async () => {
    const todos = await todoRepository.getAllTodos(2);
    expect(todos).toStrictEqual([seed.services, seed.routes]);
  })

  test('getTodosByStatus should return todos of a certain status', async () => {
    const todos = await todoRepository.getTodosByStatus(2, ['COMPLETED', 'CANCELLED']);
    expect(todos).toStrictEqual([seed.services, seed.routes]);
  })

  test('getTodosByTags should return todos of a certain tag', async () => {
    const todos = await todoRepository.getTodosByTags(1, ['prod', 'feature']);
    expect(todos).toStrictEqual([seed.database, seed.orm]);
  })

  test('getTodosByStatusOrTags should return todos of a certain status and tag', async () => {
    const todos = await todoRepository.getTodosByTagsOrStatus(2, ['CANCELLED'], ['scratch', 'staging']);
    expect(todos).toStrictEqual([seed.routes]);
  })

  test('updateTodo should return the updated todo', async () => {
    testTodo.tags = [ 'prod', 'scratch' ];
    expectedTodo.tags = [ { tag: { name: 'test', id: 1 } }, { tag: {name: 'prod', id: 2 } }, { tag: {name: 'scratch', id: 5 } } ];
    const todo = await todoRepository.updateTodo(1, 5, {...testTodo});
    expect(todo).toMatchObject({...expectedTodo});
  })

  test('deleteTodo should return the deleted todo', async () => {
    const todo = await todoRepository.deleteTodo(1, 1);
    expect(todo).toMatchObject(seed.database);
  })

})
