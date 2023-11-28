# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.1.0] - 2023-11-28

### Added

- Optional `notes` field on jobs
- Health check reports uptime and database state, and returns 503 when MongoDB is down
- Healthchecks for the docker-compose services
- Coverage thresholds, coverage report uploaded from CI
- Contributing guide, issue and pull request templates

### Changed

- Upgraded Mongoose to v8 and express-rate-limit to v7
- Job list runs the page query and the count in parallel and returns lean documents
- Unexpected errors are logged, and their details are hidden in production
- `JWT_LIFETIME` defaults to `1d`

### Fixed

- Expired tokens get a clear "Token expired" message
- Passwords longer than 72 characters are rejected instead of being silently truncated by bcrypt

## [1.0.0] - 2023-11-09

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

[1.1.0]: https://github.com/mohamedaminehamdi/Jobs-Api/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/mohamedaminehamdi/Jobs-Api/releases/tag/v1.0.0
