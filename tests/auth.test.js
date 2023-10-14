const request = require('supertest');
const server = require('./server');
const User = require('../models/User');

const user = { name: 'Jane', email: 'jane@example.com', password: 'secret123' };

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(server).post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ name: 'Jane', email: 'jane@example.com' });
    expect(typeof res.body.token).toBe('string');
  });

  it('accepts optional lastName and location', async () => {
    const res = await request(server)
      .post('/api/v1/auth/register')
      .send({ ...user, lastName: 'Doe', location: 'Tunis' });
    expect(res.body.user).toMatchObject({ lastName: 'Doe', location: 'Tunis' });
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
    expect(res.body.user).toEqual({ name: 'Jane', email: 'jane@example.com' });
    expect(typeof res.body.token).toBe('string');
  });

  it('requires email and password', async () => {
    const res = await request(server).post('/api/v1/auth/login').send({ email: user.email });
    expect(res.status).toBe(400);
  });

  it('matches emails case-insensitively', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: ' JANE@example.com ', password: user.password });
    expect(res.status).toBe(200);
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

const registerAndGetToken = async (body = user) => {
  const res = await request(server).post('/api/v1/auth/register').send(body);
  return `Bearer ${res.body.token}`;
};

describe('GET /api/v1/auth/me', () => {
  it('returns the current user profile', async () => {
    const token = await registerAndGetToken({ ...user, location: 'Tunis' });
    const res = await request(server).get('/api/v1/auth/me').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ name: 'Jane', email: 'jane@example.com', location: 'Tunis' });
  });

  it('requires authentication', async () => {
    const res = await request(server).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a token whose user no longer exists', async () => {
    const token = await registerAndGetToken();
    await User.deleteMany({});
    const res = await request(server).get('/api/v1/auth/me').set('Authorization', token);
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/v1/auth/updateUser', () => {
  const update = (token, body) =>
    request(server).patch('/api/v1/auth/updateUser').set('Authorization', token).send(body);

  it('updates profile fields and returns a fresh token', async () => {
    const token = await registerAndGetToken();
    const res = await update(token, { name: 'Janet', location: 'Sousse' });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ name: 'Janet', email: 'jane@example.com', location: 'Sousse' });

    const me = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(me.body.user.name).toBe('Janet');
  });

  it('cannot change the password', async () => {
    const token = await registerAndGetToken();
    await update(token, { name: 'Janet', password: 'hijacked' });
    const login = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
  });

  it('rejects an email used by another account', async () => {
    await registerAndGetToken({ ...user, email: 'taken@example.com' });
    const token = await registerAndGetToken();
    const res = await update(token, { email: 'taken@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/Duplicate/);
  });

  it('rejects an empty update', async () => {
    const token = await registerAndGetToken();
    const res = await update(token, {});
    expect(res.status).toBe(400);
  });
});
