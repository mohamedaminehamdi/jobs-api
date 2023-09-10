const request = require('supertest');
const app = require('../app');

describe('unknown routes', () => {
  it('returns 404 with a JSON message', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: 'Route does not exist' });
  });
});

describe('GET /api/v1/health', () => {
  it('reports the service is up', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('request body', () => {
  it('rejects payloads larger than 10kb', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@b.co', password: 'x'.repeat(11 * 1024) });
    expect(res.status).toBe(413);
  });
});
