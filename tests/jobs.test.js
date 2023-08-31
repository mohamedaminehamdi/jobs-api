const request = require('supertest');
const app = require('../app');

const register = async (email = 'jane@example.com') => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Jane', email, password: 'secret123' });
  return `Bearer ${res.body.token}`;
};

const createJob = (token, job = { company: 'Acme', position: 'Backend Developer' }) =>
  request(app).post('/api/v1/jobs').set('Authorization', token).send(job);

describe('jobs', () => {
  let token;
  beforeEach(async () => {
    token = await register();
  });

  it('creates a job with pending status by default', async () => {
    const res = await createJob(token);
    expect(res.status).toBe(201);
    expect(res.body.job).toMatchObject({
      company: 'Acme',
      position: 'Backend Developer',
      status: 'pending',
    });
  });

  it('requires company and position', async () => {
    const res = await createJob(token, {});
    expect(res.status).toBe(400);
  });

  it('lists only the current user jobs', async () => {
    await createJob(token);
    await createJob(token, { company: 'Globex', position: 'SRE' });
    const res = await request(app).get('/api/v1/jobs').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });
});
