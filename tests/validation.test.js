const request = require('supertest');
const server = require('./server');

const register = (body) => request(server).post('/api/v1/auth/register').send(body);

describe('request validation', () => {
  it('lists every missing register field', async () => {
    const res = await register({});
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('name is required, email is required, password is required');
  });

  it('enforces a minimum password length', async () => {
    const res = await register({ name: 'Jane', email: 'jane@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/password length must be at least 6/);
  });

  it('caps the password at 72 characters', async () => {
    const res = await register({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'x'.repeat(73),
    });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/password length must be less than or equal to 72/);
  });

  describe('jobs', () => {
    let token;
    beforeEach(async () => {
      const res = await register({ name: 'Jane', email: 'jane@example.com', password: 'secret' });
      token = `Bearer ${res.body.token}`;
    });

    it('rejects an unknown status', async () => {
      const res = await request(server)
        .post('/api/v1/jobs')
        .set('Authorization', token)
        .send({ company: 'Acme', position: 'Dev', status: 'hired' });
      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/status must be one of/);
    });

    it('strips fields that are not part of the schema', async () => {
      const res = await request(server)
        .post('/api/v1/jobs')
        .set('Authorization', token)
        .send({ company: 'Acme', position: 'Dev', createdBy: '64e3a1f0c2a4b5d6e7f80910' });
      expect(res.status).toBe(201);
      expect(res.body.job.createdBy).not.toBe('64e3a1f0c2a4b5d6e7f80910');
    });

    it('rejects an empty update', async () => {
      const created = await request(server)
        .post('/api/v1/jobs')
        .set('Authorization', token)
        .send({ company: 'Acme', position: 'Dev' });
      const res = await request(server)
        .patch(`/api/v1/jobs/${created.body.job._id}`)
        .set('Authorization', token)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
