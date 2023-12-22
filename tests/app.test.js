const request = require('supertest');
const server = require('./server');

describe('unknown routes', () => {
  it('returns 404 with a JSON message', async () => {
    const res = await request(server).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: 'Route does not exist' });
  });
});

describe('GET /api/v1/health', () => {
  it('reports the service is up', async () => {
    const res = await request(server).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'connected' });
    expect(typeof res.body.uptime).toBe('number');
  });
});

describe('request body', () => {
  it('rejects payloads larger than 10kb', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'a@b.co', password: 'x'.repeat(11 * 1024) });
    expect(res.status).toBe(413);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: 'Malformed JSON in request body' });
  });
});

describe('docs', () => {
  it('links to the docs from the root route', async () => {
    const res = await request(server).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('href="/api-docs"');
  });

  it('serves Swagger UI', async () => {
    const res = await request(server).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});

describe('request ids', () => {
  it('generates an id for every response', async () => {
    const first = await request(server).get('/api/v1/health');
    const second = await request(server).get('/api/v1/health');
    expect(first.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(first.headers['x-request-id']).not.toBe(second.headers['x-request-id']);
  });

  it('keeps a well-formed incoming id', async () => {
    const res = await request(server).get('/api/v1/health').set('X-Request-Id', 'proxy-abc_123');
    expect(res.headers['x-request-id']).toBe('proxy-abc_123');
  });

  it('replaces an incoming id that could forge log lines', async () => {
    const res = await request(server)
      .get('/api/v1/health')
      .set('X-Request-Id', 'abc "GET /admin" 200');
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
