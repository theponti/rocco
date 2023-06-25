import dotenv from "dotenv";
dotenv.config();

import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import authPlugin from "./plugins/auth";
import shutdownPlugin from "./plugins/shutdown";
import prismaPlugin from "./plugins/prisma";
import emailPlugin from "./plugins/email";
import statusPlugin from "./plugins/status";
import usersPlugin from "./plugins/user";
import rateLimitPlugin from "./plugins/rate-limit";
import circuitBreaker from "./plugins/circuit-breaker";
import sessionPlugin from "./plugins/session";

const { APP_URL, PORT } = process.env;

export function createServer(opts: FastifyServerOptions = {}): FastifyInstance {
  const server = fastify(opts);

  server.register(shutdownPlugin);
  server.register(sessionPlugin);
  server.register(require("fastify-csrf"), { cookieOpts: {} });
  server.register(require("@fastify/helmet"));
  server.register(require("@fastify/cors"), {
    origin: [APP_URL as string],
    credentials: true,
  });
  server.register(circuitBreaker);
  server.register(prismaPlugin);
  server.register(rateLimitPlugin);
  server.register(statusPlugin);
  server.register(emailPlugin);
  server.register(authPlugin);
  server.register(usersPlugin);

  return server;
}

export async function startServer() {
  const server = createServer({
    logger: true,
    disableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== "true",
  });

  if (!PORT) {
    server.log.error("Missing PORT env var");
    process.exit(1);
  }

  try {
    await server.listen(PORT, "0.0.0.0");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
