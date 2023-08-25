const request = require('supertest');
const app = require('../app');

describe('unknown routes', () => {
  it('returns 404 with a JSON message', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: 'Route does not exist' });
  });
});
