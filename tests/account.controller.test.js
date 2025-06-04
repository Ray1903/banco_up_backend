// Unit tests for account.controller.js
// Covers creation, activation, and deactivation of accounts using mocked database methods
const {
  createAccount,
  activateAccount,
  deactivateAccount
} = require('../controllers/account.controller');
const db = require('../models');
const httpMocks = require('node-mocks-http');
const { createLogger } = require('../scripts/logger');
const log = createLogger('account_controller_test.log');

jest.mock('../models');

describe('Account Controller', () => {
  afterEach(() => jest.clearAllMocks());

  it('✅ should create a new account if user does not already have one', async () => {
    const req = httpMocks.createRequest({ body: { userID: 1 } });
    const res = httpMocks.createResponse();

    db.Account.findOne.mockResolvedValue(null);
    db.Account.create.mockResolvedValue({ id: 10, userID: 1 });

    await createAccount(req, res);

    const status = res._getStatusCode();
    const data = JSON.parse(res._getData());

    log('createAccount OK -> status:', status, 'response:', data);

    expect(status).toBe(201);
    expect(data).toHaveProperty('message', 'Account created successfully');
  });

  it('❌ should return 400 if account already exists', async () => {
    const req = httpMocks.createRequest({ body: { userID: 1 } });
    const res = httpMocks.createResponse();

    db.Account.findOne.mockResolvedValue({ id: 99 });

    await createAccount(req, res);

    const status = res._getStatusCode();
    const data = JSON.parse(res._getData());

    log('createAccount FAIL (ya existe) -> status:', status, 'response:', data);

    expect(status).toBe(400);
    expect(data).toHaveProperty('message', 'User already has an account.');
  });

  it('🟢 should activate an existing account', async () => {
    const req = httpMocks.createRequest({ body: { accountID: 123 } });
    const res = httpMocks.createResponse();

    const mockAccount = { update: jest.fn() };
    db.Account.findByPk.mockResolvedValue(mockAccount);

    await activateAccount(req, res);

    const status = res._getStatusCode();
    const data = JSON.parse(res._getData());

    log('activateAccount OK -> status:', status, 'response:', data);

    expect(mockAccount.update).toHaveBeenCalledWith({ active: true });
    expect(status).toBe(200);
    expect(data).toHaveProperty('message', 'Account activated');
  });

  it('❌ should return 404 if account not found (activation)', async () => {
    const req = httpMocks.createRequest({ body: { accountID: 999 } });
    const res = httpMocks.createResponse();

    db.Account.findByPk.mockResolvedValue(null);

    await activateAccount(req, res);

    const status = res._getStatusCode();
    const data = JSON.parse(res._getData());

    log('activateAccount FAIL -> status:', status, 'response:', data);

    expect(status).toBe(404);
    expect(data).toHaveProperty('message', 'Account not found');
  });

  it('🔻 should deactivate an existing account', async () => {
    const req = httpMocks.createRequest({ body: { accountID: 456 } });
    const res = httpMocks.createResponse();

    const mockAccount = { update: jest.fn() };
    db.Account.findByPk.mockResolvedValue(mockAccount);

    await deactivateAccount(req, res);

    const status = res._getStatusCode();
    const data = JSON.parse(res._getData());

    log('deactivateAccount OK -> status:', status, 'response:', data);

    expect(mockAccount.update).toHaveBeenCalledWith({ active: false });
    expect(status).toBe(200);
    expect(data).toHaveProperty('message', 'Account deactivated');
  });

  it('❌ should return 404 if account not found (deactivation)', async () => {
    const req = httpMocks.createRequest({ body: { accountID: 888 } });
    const res = httpMocks.createResponse();

    db.Account.findByPk.mockResolvedValue(null);

    await deactivateAccount(req, res);

    const status = res._getStatusCode();
    const data = JSON.parse(res._getData());

    log('deactivateAccount FAIL -> status:', status, 'response:', data);

    expect(status).toBe(404);
    expect(data).toHaveProperty('message', 'Account not found');
  });
});
