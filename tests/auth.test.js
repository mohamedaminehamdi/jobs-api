const request = require('supertest');
const app = require('../app');

const user = { name: 'Jane', email: 'jane@example.com', password: 'secret123' };

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ name: 'Jane' });
    expect(typeof res.body.token).toBe('string');
  });
});
