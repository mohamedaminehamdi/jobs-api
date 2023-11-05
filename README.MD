# Jobs API

[![CI](https://github.com/mohamedaminehamdi/Jobs-Api/actions/workflows/ci.yml/badge.svg)](https://github.com/mohamedaminehamdi/Jobs-Api/actions/workflows/ci.yml)

A REST API for keeping track of job applications. Users register, log in with a JWT and manage
their own list of applications: where they applied, for which position, and how far it went.

## Features

- JWT authentication with bcrypt-hashed passwords
- Job applications CRUD, scoped to the logged-in user
- Search, filtering, sorting and pagination on the job list
- Stats endpoint: applications per status and per month
- Profile and password updates
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
