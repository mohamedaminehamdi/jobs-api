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

  it('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...user, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/valid email/);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(user);
    const res = await request(app).post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/Duplicate/);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => request(app).post('/api/v1/auth/register').send(user));

  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ name: 'Jane' });
    expect(typeof res.body.token).toBe('string');
  });

  it('requires email and password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: user.email });
    expect(res.status).toBe(400);
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  it('rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: user.password });
    expect(res.status).toBe(401);
  });
});
