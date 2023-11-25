# Contributing

Thanks for taking the time to contribute!

## Development setup

1. Fork and clone the repository.
2. Install dependencies with `npm install` (Node.js 18+, see `.nvmrc`).
3. Copy `.env.example` to `.env` and point `MONGO_URI` at a MongoDB instance.
4. Start the server with `npm run dev`.

## Before opening a pull request

- `npm run lint` and `npm run format:check` pass
- `npm test` passes and new behaviour is covered by tests
- `swagger.yaml` is updated when an endpoint changes
- `CHANGELOG.md` has an entry under **Unreleased**

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `perf:`, `chore:`, `ci:`, `style:`.
Use a scope when it helps, for example `feat(jobs): ...`.

## Reporting bugs

Open an issue with the steps to reproduce, what you expected and what happened instead.
