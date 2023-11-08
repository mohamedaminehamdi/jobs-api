# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Job search, status and type filters, sorting and pagination
- `GET /jobs/stats` with counts per status and monthly applications
- `jobType` and `jobLocation` fields and the `offer` status
- Profile endpoints: `GET /auth/me`, `PATCH /auth/updateUser`, `PATCH /auth/updatePassword`
- Read-only demo user and a seed script with mock data
- Joi request validation for bodies, query strings and route params
- OpenAPI spec served with Swagger UI at `/api-docs`
- Health check endpoint, request logging, gzip compression
- Mongo operator sanitizing, configurable CORS, stricter rate limit on auth routes
- Jest + Supertest test suite with an in-memory MongoDB
- ESLint, Prettier, Dockerfile, docker-compose and GitHub Actions CI

### Changed

- Upgraded Mongoose to v7, jsonwebtoken to v9, helmet to v7 and the rest of the dependencies
- Split the Express app from the server bootstrap; the server validates its environment on start
  and shuts down gracefully
- Job list responses return `totalJobs` and `numOfPages` instead of `count`
- Auth responses return the full user profile

### Fixed

- Passwords were re-hashed on every save
- Token lifetime was read from a misspelled environment variable
- Errors thrown after authentication were reported as 401
- Unknown routes and malformed JSON now return JSON errors
