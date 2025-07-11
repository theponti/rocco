# rocco

This monorepo holds the services for Rocco.

### Apps

- `web`: React web application to store places

## Packages

- `ui`: component library

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev) for linting and formatting (replacing ESLint and Prettier)

## Setup

1. Set environment variables:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
   - Set `COOKIE_SALT` with helper function
   - Set `COOKIE_SECRET` with helper function
   - Set `SEGMENT_KEY` with helper function
1. Install dependencies: `pnpm install`
1. Build all apps and packages: `pnpm build`
1. Start postgres and redis: `docker-compose up -d`
1. Start dev services: `pnpm dev`