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

    it('only accepts http(s) posting links', async () => {
      const post = (jobUrl) =>
        request(server)
          .post('/api/v1/jobs')
          .set('Authorization', token)
          .send({ company: 'Acme', position: 'Dev', jobUrl });
      expect((await post('https://jobs.example.com/123')).status).toBe(201);
      expect((await post('javascript:alert(1)')).status).toBe(400);
      expect((await post('not a url')).status).toBe(400);
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

describe('salary range', () => {
  let token;
  const create = (job) =>
    request(server)
      .post('/api/v1/jobs')
      .set('Authorization', token)
      .send({ company: 'Acme', position: 'Dev', ...job });

  beforeEach(async () => {
    const res = await register({ name: 'Jane', email: 'jane@example.com', password: 'secret' });
    token = `Bearer ${res.body.token}`;
  });

  it('stores a salary range', async () => {
    const res = await create({ salaryMin: 3000, salaryMax: 4500 });
    expect(res.status).toBe(201);
    expect(res.body.job).toMatchObject({ salaryMin: 3000, salaryMax: 4500 });
  });

  it('accepts only one bound', async () => {
    expect((await create({ salaryMax: 4500 })).status).toBe(201);
  });

  it('rejects a maximum below the minimum', async () => {
    const res = await create({ salaryMin: 5000, salaryMax: 4500 });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/salaryMax must be greater than or equal to/);
  });

  it('checks a partial update against the stored range', async () => {
    const { body } = await create({ salaryMin: 3000, salaryMax: 4500 });
    const update = (job) =>
      request(server).patch(`/api/v1/jobs/${body.job._id}`).set('Authorization', token).send(job);

    const res = await update({ salaryMax: 2000 });
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('salaryMax must be greater than or equal to salaryMin');
    expect((await update({ salaryMin: 4000 })).status).toBe(200);
  });

  it('rejects negative salaries', async () => {
    expect((await create({ salaryMin: -1 })).status).toBe(400);
  });
});
