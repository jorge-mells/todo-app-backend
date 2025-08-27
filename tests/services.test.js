// NOTE: these tests are very brittle. They depend highly on the order of methods called within the auth functions
import { vi, expect, test, describe } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as activeTokenStore from '../src/data/active-token-store.js'
import * as userRepository from '../src/data/user-repository.js'
import * as authService from '../src/services/auth-service.js';

vi.mock("../src/data/active-token-store.js");
vi.mock("../src/data/user-repository.js");
vi.mock("../src/data/todo-repository.js");

vi.mock("jsonwebtoken", () => {
  return {
    default: {
      verify: vi.fn(() => ({ type: 'access', id: 1 })), 
      sign: vi.fn(() => 'signed token'),
    },
  };
});

vi.mock("bcrypt", () => {
  return {
    default: {
      compare: vi.fn(),
      genSalt: vi.fn(() => 'salt'),
      hash: vi.fn(() => 'hash')
    },
  };
});

vi.mock("zxcvbn", () => {
  return {
    default: vi.fn(() => ({ score: 3 })),
  };
});

async function testHttpErrorHelper(method, params, errorMessage, statusCode) {
  try {
    await method(...params);
    expect(true).toBe(false);
  } catch (error) {
    expect(error.message).toBe(errorMessage);
    expect(error.statusCode).toBe(statusCode);
  }
}


describe('Auth Service Tests', () => {

  test('verifyToken should ensure the auth token is correct based on type', async () => {
    // Test that non matching access types trigger an Error
    vi.mocked(jwt.verify).mockReturnValueOnce({ type: 'refresh', id: 1 });
    vi.mocked(activeTokenStore.isActive).mockReturnValueOnce(false);
    await testHttpErrorHelper(authService.verifyToken, ['test-token', 'access'], 'invalid token', 403);
    // Test that access tokens are the latest
    vi.mocked(jwt.verify).mockReturnValueOnce({ type: 'access', id: 2 });
    vi.mocked(activeTokenStore.isActive).mockReturnValueOnce(false);
    await testHttpErrorHelper(authService.verifyToken, ['test-token', 'access'], 'invalid token', 403);
    //Test that jwt thrown errors are handled appropriately
    const throwNamedError = (name, message) => {
      const error = new Error(message);
      error.name = name;
      throw error;
    }
    vi.mocked(jwt.verify).mockImplementation(() => {
      throwNamedError('TokenExpiredError', 'some message');
    })
    await testHttpErrorHelper(authService.verifyToken, ['test-token', 'refresh'], 'expired token', 401);
    vi.mocked(jwt.verify).mockImplementation(() => {
      throwNamedError('JsonWebTokenError', 'some message');
    })
    await testHttpErrorHelper(authService.verifyToken, ['test-token', 'access'], 'invalid token', 401);
  })

  test('checkCredentials should ensure credentials passed during login are correct', async () =>{
    vi.mocked(userRepository.getUser).mockReturnValue({ id: 1, password: 'test-password' });
    vi.mocked(bcrypt.compare).mockReturnValue(true);
    // Test that the user exists
    vi.mocked(userRepository.getUser).mockReturnValueOnce(null);
    await testHttpErrorHelper(authService.checkCredentials, ['test-user', 'test-password'], 'invalid username', 401);
    // Test that an error is thrown when password is false
    vi.mocked(bcrypt.compare).mockReturnValueOnce(false);
    await testHttpErrorHelper(authService.checkCredentials, ['test-user', 'test-password'], 'invalid password', 401);
    // Test that the token is really activated
    // unmock the token store and use this for activate, so you can observe that tokens overwrite
    const actualTokenStore = await vi.importActual('../src/data/active-token-store.js');
    await actualTokenStore.activate(1, 'old-token');
    vi.mocked(activeTokenStore.activate).mockImplementation(actualTokenStore.activate)
    vi.mocked(userRepository.updateUser).mockReturnValueOnce(null);
    const result = await authService.checkCredentials('test-user', 'test-password');
    expect(await actualTokenStore.isActive(1, 'old-token')).toBe(false);
    expect(await actualTokenStore.isActive(1, 'signed token')).toBe(true);
    expect(result).toStrictEqual({
      id: 1,
      refreshToken: 'signed token',
      token: 'signed token',
      message: 'successful',
    })
  })

  test('createCredentials should first validate that valid credentials are passed and should create a new user', async () =>{
    vi.mocked(userRepository.getUser).mockReturnValue(null);
    vi.mocked(userRepository.createUser).mockReturnValue({ id: 2, password: 'test-password' });
    vi.mocked(userRepository.updateUser).mockReturnValue(null);
    // Test that an error is thrown for a taken username
    vi.mocked(userRepository.getUser).mockReturnValueOnce({ id: 1, password: 'test-password' });
    await testHttpErrorHelper(authService.createCredentials, ['test-user', 'test-password'], 'username already exists', 409);
    // Test that the username is being checked
    await testHttpErrorHelper(authService.createCredentials, ['_test-user', 'test-password'], 'invalid username: username should start with a letter or number, and should only contain letters, numbers, -, and _', 400);
    // Test that credentials are created when everything is valid
    const result = await authService.createCredentials('unused-username', 'strong password');
    expect(result).toStrictEqual({
      id: 2,
      token: 'signed token',
      refreshToken: 'signed token',
      message: 'successful registration'
    })
  })

  test('refreshToken should create a new long lived token and return it', async () => {
    vi.mocked(userRepository.getUserByToken).mockReturnValue({ id: 1, refreshToken: 'different' });
    vi.mocked(userRepository.updateUser).mockReturnValue({ id: 1 });
    // Test that revocation of tokens is checked(different tokens are rejected)
    await testHttpErrorHelper(authService.refreshToken, ['same'], 'invalid token', 401);
    // Test that revocation of tokens is checked(isRevoked must be false)
    vi.mocked(userRepository.getUserByToken).mockReturnValueOnce({ id: 1, isRevoked: true });
    await testHttpErrorHelper(authService.refreshToken, ['different'], 'invalid token', 401);
    // Test that revocation of tokens is checked(user doesn't exist)
    vi.mocked(userRepository.getUserByToken).mockReturnValueOnce(null);
    await testHttpErrorHelper(authService.refreshToken, ['different'], 'invalid token', 401);
    // Test that when everything is correct, tokens are created
    vi.mocked(jwt.verify).mockReturnValue({ type: 'refresh', id: 1 });
    const result = await authService.refreshToken('different');
    expect(result).toStrictEqual({
      id: 1,
      token: 'signed token',
      refreshToken: 'signed token',
      message: 'successful token refresh'
    })
  })

  test('revokeToken should revoke all tokens', async () => {
    vi.mocked(userRepository.getUserByToken).mockReturnValue({ id: 1, refreshToken: 'different' });
    vi.mocked(userRepository.updateUser).mockReturnValue({ id: 1 });
    // Test that valid users result in successful revocation
    const actualTokenStore = await vi.importActual('../src/data/active-token-store.js');
    await actualTokenStore.activate(1, 'current-token');
    vi.mocked(activeTokenStore.activate).mockImplementationOnce(actualTokenStore.activate)
    vi.mocked(activeTokenStore.deactivate).mockImplementationOnce(actualTokenStore.deactivate)
    const result = await authService.revokeToken('current-token');
    expect(await actualTokenStore.isActive(1, 'current-token')).toBe(false);
    expect(result).toStrictEqual({
      id: 1,
      message: 'successful logout'
    })
    // Test that invalid users result in an error
    vi.mocked(userRepository.getUserByToken).mockReturnValueOnce(null);
    await testHttpErrorHelper(authService.revokeToken, ['current-token'], 'invalid token', 400);
  })
})
