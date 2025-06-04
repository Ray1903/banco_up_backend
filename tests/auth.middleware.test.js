// Unit tests for auth.middleware.js
// Verifies correct JWT handling: valid token, missing token, and invalid token scenarios
const authMiddleware = require('../middlewares/auth.middleware');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');
const { createLogger } = require('../scripts/logger');

jest.mock('jsonwebtoken');
const log = createLogger('auth_middleware_test.log');

describe('Auth Middleware', () => {
  afterEach(() => jest.clearAllMocks());

  it('✅ allows request with valid token', () => {
    const mockUser = { id: 1, tipo: 'normal' };
    const token = 'valid.token.here';
    jwt.verify.mockReturnValue(mockUser);

    const req = httpMocks.createRequest({
      headers: { authorization: `Bearer ${token}` }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    log('VALID TOKEN → usuario:', req.usuario, 'status:', res._getStatusCode());
    expect(req.usuario).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('❌ rejects request with no Authorization header', () => {
    const req = httpMocks.createRequest(); // No headers
    const res = httpMocks.createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    const status = res._getStatusCode();
    const data = res._getData();
    log('NO TOKEN → status:', status, 'response:', data);

    expect(status).toBe(401);
    expect(JSON.parse(data)).toHaveProperty('message', 'Token no proporcionado');
    expect(next).not.toHaveBeenCalled();
  });

  it('❌ rejects request with invalid token', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = httpMocks.createRequest({
      headers: { authorization: 'Bearer fake.invalid.token' }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    const status = res._getStatusCode();
    const data = res._getData();
    log('INVALID TOKEN → status:', status, 'response:', data);

    expect(status).toBe(403);
    expect(JSON.parse(data)).toHaveProperty('message', 'Token inválido o expirado');
    expect(next).not.toHaveBeenCalled();
  });
});
