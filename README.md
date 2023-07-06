# rocco

This monorepo holds the services for Rocco.

### Apps
- `api`: Fastify API server
- `web`: React web application

## Packages

- `eslint-config-custom`: ESLint configuration
- `ui`: component library
- `tsconfig`: TypeScript configurations

### Utilities
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup

1. Set environment variables:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
   - Set `COOKIE_SALT` with helper function
   - Set `COOKIE_SECRET` with helper function
   - Set `SEGMENT_KEY` with helper function
1. Install dependencies: `pnpm install`
2. Build all apps and packages: `pnpm build`
3. Start postgres and redis: `docker-compose up -d`
4. Migrate the database: `pnpm turbo:migrate`
5. Start dev services: `pnpm dev`


## Resources

Learn more about the power of Turborepo:
- **Turbo**
  - [Pipelines](https://turborepo.org/docs/features/pipelines)
  - [Caching](https://turborepo.org/docs/features/caching)
  - [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching)
  - [Scoped Tasks](https://turborepo.org/docs/features/scopes)
  - [Configuration Options](https://turborepo.org/docs/reference/configuration)
  - [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
