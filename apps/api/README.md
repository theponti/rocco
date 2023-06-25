# Fastify & Prisma Server

This repo uses the following technologies:

- [**Fastify**](https://www.fastify.io/): Fast and low overhead web framework, for Node.js
  - [**@fastify/secure-session**](https://www.npmjs.com/package/@fastify/secure-session): Session management
  - [**fastify-csrf**](https://github.com/fastify/fastify-csrf): Protect against CSRF attacks
  - [**@fastify/circuit-breaker**](https://www.npmjs.com/package/@fastify/circuit-breaker): Provide [_circuit breaker_](https://martinfowler.com/bliki/CircuitBreaker.html) architecture
- [**Prisma**](https://www.prisma.io/): Next-generation type-safe ORM
- [**PostgreSQL**](https://www.postgresql.org/): powerful, open source object-relational database system

## DB Schema

The database schema is defined using the [Prisma schema](./prisma/schema.prisma) which defines 1 model:

- User

## Getting started

### Prerequisites

- A PostgreSQL DB

### Steps

1. clone repo
2. create `.env` file from `.env.example`
3. Define `DATABASE_URL`
4. Define `COOKIE_NAME`
5. Generate and define `COOKIE_SECRET`
6. Generate and define `COOKIE_SALT`
7. Define schema in `prisma/schema.prisma`
8. Run `pnpm install` to install dependencies
9. Run `pnpm migrate:dev` to run schema migrations with [Prisma Migrate](https://www.prisma.io/migrate)
10. Run `pnpm dev` to start dev server and run the API
