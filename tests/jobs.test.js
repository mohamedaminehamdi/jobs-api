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
      jobType: 'full-time',
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
    expect(res.body.totalJobs).toBe(2);
  });

  it('gets a single job', async () => {
    const { body } = await createJob(token);
    const res = await request(app).get(`/api/v1/jobs/${body.job._id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.job._id).toBe(body.job._id);
  });

  it('updates a job', async () => {
    const { body } = await createJob(token);
    const res = await request(app)
      .patch(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token)
      .send({ status: 'interview', jobLocation: 'Tunis' });
    expect(res.status).toBe(200);
    expect(res.body.job).toMatchObject({ status: 'interview', jobLocation: 'Tunis' });
  });

  it('rejects empty company or position on update', async () => {
    const { body } = await createJob(token);
    const res = await request(app)
      .patch(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token)
      .send({ company: '' });
    expect(res.status).toBe(400);
  });

  it('deletes a job', async () => {
    const { body } = await createJob(token);
    const del = await request(app)
      .delete(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token);
    expect(del.status).toBe(200);
    const res = await request(app).get(`/api/v1/jobs/${body.job._id}`).set('Authorization', token);
    expect(res.status).toBe(404);
  });
});

describe('job ownership', () => {
  let ownerToken;
  let otherToken;
  let jobId;

  beforeEach(async () => {
    ownerToken = await register('owner@example.com');
    otherToken = await register('other@example.com');
    jobId = (await createJob(ownerToken)).body.job._id;
  });

  it('hides other users jobs from the list', async () => {
    const res = await request(app).get('/api/v1/jobs').set('Authorization', otherToken);
    expect(res.body.totalJobs).toBe(0);
  });

  it.each([
    ['get', undefined],
    ['patch', { status: 'declined' }],
    ['delete', undefined],
  ])('returns 404 on %s of another user job', async (method, body) => {
    const req = request(app)[method](`/api/v1/jobs/${jobId}`);
    const res = await req.set('Authorization', otherToken).send(body);
    expect(res.status).toBe(404);
  });
});

describe('invalid ids', () => {
  it('returns 400 for a malformed job id', async () => {
    const token = await register();
    const res = await request(app).get('/api/v1/jobs/not-an-id').set('Authorization', token);
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Invalid job id: not-an-id');
  });
});
