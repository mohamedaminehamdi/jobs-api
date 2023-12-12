const request = require('supertest');
const server = require('./server');
const Job = require('../models/Job');

const register = async (email = 'jane@example.com') => {
  const res = await request(server)
    .post('/api/v1/auth/register')
    .send({ name: 'Jane', email, password: 'secret123' });
  return `Bearer ${res.body.token}`;
};

const createJob = (token, job = { company: 'Acme', position: 'Backend Developer' }) =>
  request(server).post('/api/v1/jobs').set('Authorization', token).send(job);

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

  it('stores optional notes', async () => {
    const res = await createJob(token, {
      company: 'Acme',
      position: 'Dev',
      notes: '  Referred by Sam, follow up next week  ',
    });
    expect(res.status).toBe(201);
    expect(res.body.job.notes).toBe('Referred by Sam, follow up next week');
  });

  it('records the initial status and every change', async () => {
    const { body } = await createJob(token);
    const patch = (update) =>
      request(server)
        .patch(`/api/v1/jobs/${body.job._id}`)
        .set('Authorization', token)
        .send(update);

    await patch({ status: 'interview' });
    await patch({ notes: 'no status change here' });
    const res = await patch({ status: 'offer' });

    expect(res.body.job.statusHistory.map((entry) => entry.status)).toEqual([
      'pending',
      'interview',
      'offer',
    ]);
    expect(Date.parse(res.body.job.statusHistory[0].changedAt)).not.toBeNaN();
  });

  it('requires company and position', async () => {
    const res = await createJob(token, {});
    expect(res.status).toBe(400);
  });

  it('lists only the current user jobs', async () => {
    await createJob(token);
    await createJob(token, { company: 'Globex', position: 'SRE' });
    const res = await request(server).get('/api/v1/jobs').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.totalJobs).toBe(2);
  });

  it('gets a single job', async () => {
    const { body } = await createJob(token);
    const res = await request(server)
      .get(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.job._id).toBe(body.job._id);
  });

  it('updates a job', async () => {
    const { body } = await createJob(token);
    const res = await request(server)
      .patch(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token)
      .send({ status: 'interview', jobLocation: 'Tunis' });
    expect(res.status).toBe(200);
    expect(res.body.job).toMatchObject({ status: 'interview', jobLocation: 'Tunis' });
  });

  it('rejects empty company or position on update', async () => {
    const { body } = await createJob(token);
    const res = await request(server)
      .patch(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token)
      .send({ company: '' });
    expect(res.status).toBe(400);
  });

  it('deletes a job', async () => {
    const { body } = await createJob(token);
    const del = await request(server)
      .delete(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ msg: 'Job removed' });
    const res = await request(server)
      .get(`/api/v1/jobs/${body.job._id}`)
      .set('Authorization', token);
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
    const res = await request(server).get('/api/v1/jobs').set('Authorization', otherToken);
    expect(res.body.totalJobs).toBe(0);
  });

  it.each([
    ['get', undefined],
    ['patch', { status: 'declined' }],
    ['delete', undefined],
  ])('returns 404 on %s of another user job', async (method, body) => {
    const req = request(server)[method](`/api/v1/jobs/${jobId}`);
    const res = await req.set('Authorization', otherToken).send(body);
    expect(res.status).toBe(404);
  });
});

describe('invalid ids', () => {
  it('returns 400 for a malformed job id', async () => {
    const token = await register();
    const res = await request(server).get('/api/v1/jobs/not-an-id').set('Authorization', token);
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Invalid job id: not-an-id');
  });
});

describe('GET /api/v1/jobs query options', () => {
  let token;
  const list = (query) =>
    request(server).get('/api/v1/jobs').query(query).set('Authorization', token);

  beforeEach(async () => {
    token = await register();
    const jobs = [
      { company: 'Acme', position: 'Backend Developer', status: 'interview', jobType: 'remote' },
      { company: 'Globex', position: 'Frontend Developer', status: 'declined' },
      { company: 'Initech', position: 'C++ Engineer', jobType: 'internship' },
    ];
    for (const job of jobs) {
      await createJob(token, job);
    }
  });

  it('filters by status', async () => {
    const res = await list({ status: 'interview' });
    expect(res.body.jobs.map((job) => job.company)).toEqual(['Acme']);
  });

  it('treats status=all as no filter', async () => {
    const res = await list({ status: 'all' });
    expect(res.body.totalJobs).toBe(3);
  });

  it('filters by jobType', async () => {
    const res = await list({ jobType: 'internship' });
    expect(res.body.jobs.map((job) => job.company)).toEqual(['Initech']);
  });

  it('searches position and company case-insensitively', async () => {
    expect((await list({ search: 'developer' })).body.totalJobs).toBe(2);
    expect((await list({ search: 'globex' })).body.totalJobs).toBe(1);
  });

  it('treats regex characters in search literally', async () => {
    const res = await list({ search: 'C++' });
    expect(res.status).toBe(200);
    expect(res.body.jobs.map((job) => job.company)).toEqual(['Initech']);
  });

  it('sorts newest first by default and supports a-z', async () => {
    const latest = await list({});
    expect(latest.body.jobs[0].company).toBe('Initech');
    const az = await list({ sort: 'a-z' });
    expect(az.body.jobs.map((job) => job.position)).toEqual([
      'Backend Developer',
      'C++ Engineer',
      'Frontend Developer',
    ]);
  });

  it('paginates results', async () => {
    const res = await list({ sort: 'oldest', page: 2, limit: 2 });
    expect(res.body).toMatchObject({ totalJobs: 3, numOfPages: 2 });
    expect(res.body.jobs.map((job) => job.company)).toEqual(['Initech']);
  });

  it('filters by several statuses', async () => {
    const res = await list({ status: 'interview,declined', sort: 'a-z' });
    expect(res.body.jobs.map((job) => job.company)).toEqual(['Acme', 'Globex']);
    expect((await list({ status: 'interview,hired' })).status).toBe(400);
  });

  it('filters by creation date', async () => {
    // move one job back in time; createdAt is immutable through mongoose
    const { _id } = await Job.findOne({ company: 'Globex' });
    await Job.collection.updateOne({ _id }, { $set: { createdAt: new Date('2023-06-15') } });

    const june = await list({ from: '2023-06-01', to: '2023-06-30' });
    expect(june.body.jobs.map((job) => job.company)).toEqual(['Globex']);
    expect((await list({ from: '2023-07-01' })).body.totalJobs).toBe(2);
    expect((await list({ to: '2023-07-01' })).body.totalJobs).toBe(1);
  });

  it('rejects an inverted or invalid date range', async () => {
    expect((await list({ from: '2023-07-01', to: '2023-06-01' })).status).toBe(400);
    expect((await list({ from: 'yesterday' })).status).toBe(400);
  });

  it('rejects invalid query params', async () => {
    const res = await list({ sort: 'random', limit: 1000 });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/sort must be one of/);
    expect(res.body.msg).toMatch(/limit must be less than or equal to 100/);
  });
});

describe('GET /api/v1/jobs/stats', () => {
  it('counts jobs per status and groups them by month', async () => {
    const token = await register();
    await createJob(token, { company: 'Acme', position: 'Dev', status: 'interview' });
    await createJob(token, { company: 'Globex', position: 'Dev', status: 'interview' });
    await createJob(token, { company: 'Initech', position: 'Dev' });
    await createJob(await register('other@example.com'));

    const res = await request(server).get('/api/v1/jobs/stats').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.defaultStats).toEqual({ pending: 1, interview: 2, offer: 0, declined: 0 });

    const month = new Date().toISOString().slice(0, 7);
    expect(res.body.monthlyApplications).toEqual([{ date: month, count: 3 }]);
  });

  it('counts jobs per type', async () => {
    const token = await register();
    await createJob(token, { company: 'Acme', position: 'Dev', jobType: 'remote' });
    await createJob(token, { company: 'Globex', position: 'Dev', jobType: 'remote' });
    await createJob(token, { company: 'Initech', position: 'Dev' });

    const res = await request(server).get('/api/v1/jobs/stats').set('Authorization', token);
    expect(res.body.typeStats).toEqual({
      'full-time': 1,
      'part-time': 0,
      remote: 2,
      internship: 0,
    });
  });

  it('returns zeros for a user without jobs', async () => {
    const token = await register();
    const res = await request(server).get('/api/v1/jobs/stats').set('Authorization', token);
    expect(res.body).toEqual({
      defaultStats: { pending: 0, interview: 0, offer: 0, declined: 0 },
      typeStats: { 'full-time': 0, 'part-time': 0, remote: 0, internship: 0 },
      monthlyApplications: [],
    });
  });
});
