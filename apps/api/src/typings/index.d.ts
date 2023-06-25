/* eslint-disable */
import { FastifyValidationResult } from "fastify/types/schema";

import { Token } from "@prisma/client";
import { Session } from "@fastify/secure-session";

interface SessionToken {
  userId: string;
  isAdmin: boolean;
  roles: string[];
}

declare module "fastify" {
  interface FastifyInstance extends FastifyServerFactory {
    getUserId: (FastifyRequest) => string;
    prisma: PrismaClient;
    sendEmailToken: Function;
    verifySession: FastifyValidationResult;
    verifyIsAdmin: FastifyValidationResult;
  }

  interface FastifyRequest
    extends FastifyRequest<RouteGenericInterface, Server, IncomingMessage> {
    auth: {
      userId: string;
      isAdmin: boolean;
    };
    session: Session;
  }
}
