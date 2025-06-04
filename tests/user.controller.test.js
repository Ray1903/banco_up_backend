// Unit tests for user.controller.js
// Covers user registration, login, profile retrieval, and user locking/unlocking
const {
  insertUser,
  login,
  getProfile,
  getUsersByBlockedStatus,
  unlockUser,
  blockUser,
} = require('../controllers/user.controller');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const httpMocks = require('node-mocks-http');
const { createLogger } = require('../scripts/logger');

jest.mock('../models');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const log = createLogger('user_controller_test.log');

describe('User Controller', () => {
  afterEach(() => jest.clearAllMocks());

  // INSERT USER
  it('✅ should create a new user', async () => {
    const req = httpMocks.createRequest({
      body: {
        email: `testuser_${Date.now()}@example.com`,
        password: 'Password1!',
        type: 'normal'
      }
    });
    const res = httpMocks.createResponse();

    db.User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedpassword');
    db.User.create.mockResolvedValue({
      get: () => ({
        id: 1, email: req.body.email, type: 'normal', failedAttempts: 0
      })
    });

    await insertUser(req, res);
    const status = res._getStatusCode();
    const data = res._getData();
    log('insertUser →', status, data);

    expect(status).toBe(201);
  });

  // LOGIN
  it('✅ should return token on successful login', async () => {
    const req = httpMocks.createRequest({
      body: { email: 'user@example.com', password: 'correct' }
    });
    const res = httpMocks.createResponse();

    const user = {
      id: 1, email: 'user@example.com', password: 'hashedpass',
      blocked: false, failedAttempts: 0,
      update: jest.fn()
    };

    db.User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked-token');

    await login(req, res);

    const status = res._getStatusCode();
    const data = res._getData();
    log('login (correct) →', status, data);

    expect(status).toBe(200);
  });

  it('❌ should return 401 on incorrect password', async () => {
    const req = httpMocks.createRequest({
      body: { email: 'user@example.com', password: 'wrong' }
    });
    const res = httpMocks.createResponse();

    const user = {
      id: 1, email: 'user@example.com', password: 'hashedpass',
      blocked: false, failedAttempts: 1,
      update: jest.fn()
    };

    db.User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);
    log('login (incorrect) →', res._getStatusCode(), res._getData());

    expect(res._getStatusCode()).toBe(401);
  });

  // GET PROFILE
  it('👤 should return profile with account', async () => {
    const req = httpMocks.createRequest();
    req.usuario = { id: 1 }; // Simula JWT middleware
    const res = httpMocks.createResponse();

    db.User.findOne.mockResolvedValue({
      id: 1,
      email: 'mock@correo.com',
      account: { id: 2, balance: 1000 }
    });

    await getProfile(req, res);
    log('getProfile →', res._getStatusCode(), res._getData());
    expect(res._getStatusCode()).toBe(200);
  });

  // GET USERS BY BLOCKED STATUS
  it('🔍 should return users with blocked=false', async () => {
    const req = httpMocks.createRequest({
      query: { blocked: '0' }
    });
    const res = httpMocks.createResponse();

    db.User.findAll.mockResolvedValue([{ id: 1, email: 'a@a.com', blocked: false }]);

    await getUsersByBlockedStatus(req, res);
    log('getUsersByBlockedStatus (blocked=0) →', res._getStatusCode(), res._getData());
    expect(res._getStatusCode()).toBe(200);
  });

  // UNLOCK USER
  it('🔓 should unlock user by ID', async () => {
    const req = httpMocks.createRequest({ body: { id: 1 } });
    const res = httpMocks.createResponse();

    db.User.findByPk.mockResolvedValue({
      update: jest.fn()
    });

    await unlockUser(req, res);
    log('unlockUser →', res._getStatusCode(), res._getData());
    expect(res._getStatusCode()).toBe(200);
  });

  // BLOCK USER
  it('🔒 should block user by ID', async () => {
    const req = httpMocks.createRequest({ body: { id: 1 } });
    const res = httpMocks.createResponse();

    db.User.findByPk.mockResolvedValue({
      update: jest.fn()
    });

    await blockUser(req, res);
    log('blockUser →', res._getStatusCode(), res._getData());
    expect(res._getStatusCode()).toBe(200);
  });
});
