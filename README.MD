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
