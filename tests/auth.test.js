const request = require('supertest');
const server = require('./server');

const user = { name: 'Jane', email: 'jane@example.com', password: 'secret123' };

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(server).post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ name: 'Jane' });
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects an invalid email', async () => {
    const res = await request(server)
      .post('/api/v1/auth/register')
      .send({ ...user, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/valid email/);
  });

  it('rejects a duplicate email', async () => {
    await request(server).post('/api/v1/auth/register').send(user);
    const res = await request(server).post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/Duplicate/);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => request(server).post('/api/v1/auth/register').send(user));

  it('returns a token for valid credentials', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ name: 'Jane' });
    expect(typeof res.body.token).toBe('string');
  });

  it('requires email and password', async () => {
    const res = await request(server).post('/api/v1/auth/login').send({ email: user.email });
    expect(res.status).toBe(400);
  });

  it('rejects a wrong password', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  it('rejects an unknown email', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: user.password });
    expect(res.status).toBe(401);
  });
});

describe('authentication middleware', () => {
  it('rejects requests without a token', async () => {
    const res = await request(server).get('/api/v1/jobs');
    expect(res.status).toBe(401);
    expect(res.body.msg).toBe('Authentication invalid');
  });

  it('rejects an invalid token', async () => {
    const res = await request(server)
      .get('/api/v1/jobs')
      .set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(401);
  });

  it('rejects a non-bearer scheme', async () => {
    const res = await request(server).get('/api/v1/jobs').set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });
});

describe('input sanitization', () => {
  it('ignores Mongo operators in login payloads', async () => {
    await request(server).post('/api/v1/auth/register').send(user);
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: { $ne: null }, password: user.password });
    expect(res.status).not.toBe(200);
  });
});
