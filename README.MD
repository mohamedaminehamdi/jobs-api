# Jobs API

[![CI](https://github.com/mohamedaminehamdi/Jobs-Api/actions/workflows/ci.yml/badge.svg)](https://github.com/mohamedaminehamdi/Jobs-Api/actions/workflows/ci.yml)

A REST API for keeping track of job applications. Users register, log in with a JWT and manage
their own list of applications: where they applied, for which position, and how far it went.

## Features

- JWT authentication with bcrypt-hashed passwords
- Job applications CRUD, scoped to the logged-in user, with salary range, posting link and notes
- Status history: every status change is recorded with its timestamp
- Search, filtering (several statuses, job type, date range), sorting and pagination
- Stats endpoint: applications per status, per job type and per month
- CSV export of any filtered list, safe to open in a spreadsheet
- Profile and password updates; changing the password signs out older sessions
- Account deletion that also removes the user's jobs
- Read-only demo account for showcasing the API
- Request validation with Joi
- Security middleware: helmet, CORS, rate limiting, XSS and NoSQL-injection sanitizing
- OpenAPI 3 documentation served with Swagger UI
- Jest + Supertest test suite running against an in-memory MongoDB
- Docker and docker-compose setup, GitHub Actions CI

## Tech stack

Node.js, Express 4, MongoDB with Mongoose, Joi, JSON Web Tokens, Jest, Supertest.

## Getting started

Requirements: Node.js 18+ and a MongoDB instance (local, Atlas, or the one from
[docker-compose](#docker)).

```bash
git clone https://github.com/mohamedaminehamdi/Jobs-Api.git
cd Jobs-Api
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

The API listens on `http://localhost:3000` and the docs are at
[`/api-docs`](http://localhost:3000/api-docs).

### Environment variables

| Variable             | Required | Description                                         |
| -------------------- | -------- | --------------------------------------------------- |
| `MONGO_URI`          | yes      | MongoDB connection string                           |
| `JWT_SECRET`         | yes      | Secret used to sign tokens                          |
| `JWT_LIFETIME`       | no       | Token lifetime, e.g. `30d`                          |
| `PORT`               | no       | HTTP port, defaults to `3000`                       |
| `CORS_ORIGIN`        | no       | Comma-separated allowed origins, defaults to `*`    |
| `DEMO_USER_EMAIL`    | no       | Email of the read-only demo account created by seed |
| `DEMO_USER_PASSWORD` | no       | Password of the read-only demo account              |

The server refuses to start when a required variable is missing.

## API

All routes are prefixed with `/api/v1`. Protected routes expect an `Authorization: Bearer <token>`
header; the token comes from register or login. Errors are returned as `{ "msg": "..." }`.

| Method | Route                  | Auth | Description                          |
| ------ | ---------------------- | ---- | ------------------------------------ |
| POST   | `/auth/register`       |      | Create an account                    |
| POST   | `/auth/login`          |      | Log in                               |
| GET    | `/auth/me`             | yes  | Current user profile                 |
| PATCH  | `/auth/updateUser`     | yes  | Update name, last name, email, place |
| PATCH  | `/auth/updatePassword` | yes  | Change password                      |
| DELETE | `/auth/me`             | yes  | Delete the account and its jobs      |
| GET    | `/jobs`                | yes  | List jobs                            |
| POST   | `/jobs`                | yes  | Create a job                         |
| GET    | `/jobs/stats`          | yes  | Counts per status, type and month    |
| GET    | `/jobs/export`         | yes  | Download jobs as CSV                 |
| GET    | `/jobs/:id`            | yes  | Get a job                            |
| PATCH  | `/jobs/:id`            | yes  | Update a job                         |
| DELETE | `/jobs/:id`            | yes  | Delete a job                         |
| GET    | `/health`              |      | Health check                         |

### Listing jobs

`GET /jobs` accepts these query parameters:

| Param     | Values                                                                                   | Default  |
| --------- | ---------------------------------------------------------------------------------------- | -------- |
| `status`  | `all`, or one or more of `pending`, `interview`, `offer`, `declined` separated by commas | `all`    |
| `jobType` | `all`, `full-time`, `part-time`, `remote`, `internship`                                  | `all`    |
| `search`  | text matched against position and company                                                |          |
| `from`    | ISO date, jobs created at or after it                                                    |          |
| `to`      | ISO date, jobs created at or before it                                                   |          |
| `sort`    | `latest`, `oldest`, `a-z`, `z-a`                                                         | `latest` |
| `page`    | page number, starting at 1                                                               | `1`      |
| `limit`   | page size, 1 to 100                                                                      | `10`     |

The response contains `jobs`, `totalJobs` and `numOfPages`.

`GET /jobs/export` takes the same filters and `sort` and returns a `jobs.csv` attachment with every
matching job.

Every response carries an `X-Request-Id` header, which also appears in the server logs. Send your
own (letters, digits, `-` and `_`) to correlate requests across services.

### Example

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"demo-password"}' | jq -r .token)

curl -s "localhost:3000/api/v1/jobs?status=interview&sort=a-z" -H "Authorization: Bearer $TOKEN"
```

## Docker

```bash
JWT_SECRET=something-long-and-random docker compose up --build
```

This starts the API on port 3000 and a MongoDB container with a persistent volume.

## Seeding

`mock-data.json` holds 40 sample applications spread over several months.

```bash
npm run seed                       # creates the read-only demo user and gives it the mock jobs
npm run seed -- jane@example.com   # replaces the jobs of an existing user with the mock jobs
```

With docker-compose: `docker compose exec api node populate.js`.

## Testing

```bash
npm test               # run the suite
npm run test:coverage  # with a coverage report in ./coverage
```

Tests use `mongodb-memory-server`, so no database needs to be running.

## Scripts

| Script           | Description          |
| ---------------- | -------------------- |
| `npm start`      | Start the server     |
| `npm run dev`    | Start with nodemon   |
| `npm test`       | Run the tests        |
| `npm run lint`   | Lint with ESLint     |
| `npm run format` | Format with Prettier |
| `npm run seed`   | Load mock data       |

## License

[MIT](LICENSE)
