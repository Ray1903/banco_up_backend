// Unit tests for transaction.controller.js
// Tests money transfer logic, including limits and validations, and transaction history retrieval
const {
  transfer,
  getTransactionsByAccount
} = require('../controllers/transaction.controller');
const db = require('../models');
const httpMocks = require('node-mocks-http');
const { createLogger } = require('../scripts/logger');

jest.mock('../models');

const log = createLogger('transaction_controller_test.log');

describe('Transaction Controller', () => {
  afterEach(() => jest.clearAllMocks());

  it('❌ should return 400 if amount is not a valid number', async () => {
    const req = httpMocks.createRequest({
      body: {
        senderId: 1,
        recipientAccountNumber: 2,
        amount: 'not_a_number',
        concept: 'Test'
      }
    });
    const res = httpMocks.createResponse();

    await transfer(req, res);
    log('TRANSFER (invalid amount) →', res._getStatusCode(), res._getData());

    expect(res._getStatusCode()).toBe(400);
  });

  it('❌ should return 400 if sender and recipient are the same', async () => {
    const req = httpMocks.createRequest({
      body: {
        senderId: 1,
        recipientAccountNumber: 1,
        amount: 600,
        concept: 'Auto-transferencia'
      }
    });
    const res = httpMocks.createResponse();

    db.Account.findOne.mockImplementation(({ where }) => {
      if (where.id === 1) return Promise.resolve({ id: 1, balance: 5000 });
      return null;
    });

    await transfer(req, res);
    log('TRANSFER (same account) →', res._getStatusCode(), res._getData());

    expect(res._getStatusCode()).toBe(400);
  });

  it('❌ should return 400 if balance is insufficient', async () => {
    const req = httpMocks.createRequest({
      body: {
        senderId: 1,
        recipientAccountNumber: 2,
        amount: 1000,
        concept: 'Pago'
      }
    });
    const res = httpMocks.createResponse();

    db.Account.findOne.mockImplementation(({ where }) => {
      if (where.id === 1) return Promise.resolve({ id: 1, balance: 500, save: jest.fn() });
      if (where.id === 2 && where.active === 1) return Promise.resolve({ id: 2, balance: 3000, active: 1, save: jest.fn() });
      return null;
    });

    await transfer(req, res);
    log('TRANSFER (insufficient funds) →', res._getStatusCode(), res._getData());

    expect(res._getStatusCode()).toBe(400);
  });

  it('✅ should return 200 on successful transfer', async () => {
    const req = httpMocks.createRequest({
      body: {
        senderId: 1,
        recipientAccountNumber: 2,
        amount: 1000,
        concept: 'Pago'
      }
    });
    const res = httpMocks.createResponse();

    const sender = { id: 1, balance: 5000, save: jest.fn() };
    const recipient = { id: 2, balance: 3000, active: 1, save: jest.fn() };

    db.Account.findOne.mockImplementation(({ where }) => {
      if (where.id === 1) return Promise.resolve(sender);
      if (where.id === 2 && where.active === 1) return Promise.resolve(recipient);
      return null;
    });

    db.TotalSentPerDay.sum.mockResolvedValue(0);
    db.Transaction.create = jest.fn().mockResolvedValue({});
    db.sequelize.transaction = async (callback) => await callback({});

    db.TotalSentPerDay.findOrCreate = jest.fn().mockResolvedValue([
      { amount: 0, save: jest.fn() }, true
    ]);
    db.TotalReceivedPerDay.findOrCreate = jest.fn().mockResolvedValue([
      { amount: 0, save: jest.fn() }, true
    ]);


    await transfer(req, res);

    const status = res._getStatusCode();
    const rawData = res._getData();

    log('TRANSFER (success) →', status, rawData);

    expect(status).toBe(200);

    try {
      const json = JSON.parse(rawData);
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('amount', 1000);
    } catch (err) {
      log('⚠️ Error al parsear JSON en transferencia exitosa:', err.message);
    }
  });

  it('🧾 should return transactions by account ID', async () => {
    const req = httpMocks.createRequest({ params: { accountId: 1 } });
    const res = httpMocks.createResponse();

    db.Transaction.findAll.mockResolvedValue([
      { id: 1, amount: 500, senderID: 1 },
      { id: 2, amount: 200, receiverID: 1 }
    ]);

    await getTransactionsByAccount(req, res);

    const status = res._getStatusCode();
    const rawData = res._getData();

    log('GET TRANSACTIONS →', status, rawData);

    expect(status).toBe(200);

    try {
      const transactions = JSON.parse(rawData);
      expect(Array.isArray(transactions)).toBe(true);
    } catch (err) {
      log('⚠️ Error al parsear JSON en transacciones:', err.message);
    }
  });
});
