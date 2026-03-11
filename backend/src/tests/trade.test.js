// tests/trade.test.js

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');
const { generateAccessToken } = require('../src/middleware/auth.middleware');

// Mock DB and Redis to avoid real connections in unit tests
jest.mock('../src/config/database');
jest.mock('../src/config/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  client: { setex: jest.fn() },
}));

const mockUser = { id: 'user-uuid-1234', email: 'test@example.com', role: 'user' };
const authToken = generateAccessToken(mockUser);

describe('Trade API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/trades', () => {
    it('should create a trade with valid payload', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 'trade-uuid-1234',
          user_id: mockUser.id,
          asset: 'ETH',
          type: 'buy',
          order_type: 'market',
          quantity: 1.5,
          price: 3200,
          status: 'pending',
          created_at: new Date(),
        }],
      });

      const res = await request(app)
        .post('/api/v1/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ asset: 'ETH', type: 'buy', quantity: 1.5 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.asset).toBe('ETH');
    });

    it('should reject invalid trade payload', async () => {
      const res = await request(app)
        .post('/api/v1/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ asset: 'ETH' }); // missing required fields

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/trades')
        .send({ asset: 'ETH', type: 'buy', quantity: 1.5 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/trades', () => {
    it('should return paginated trade list', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 't1', asset: 'BTC', status: 'settled' }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app)
        .get('/api/v1/trades')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});