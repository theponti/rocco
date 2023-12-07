import { FastifyInstance } from "fastify";

import { verifySession } from "../../auth";

const getListRoute = (server: FastifyInstance) => {
  server.get(
    "/lists/:id",
    {
      preValidation: verifySession,
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const lists = await prisma.list.findUnique({
        where: { id },
      });
      return lists;
    },
  );
};

export default getListRoute;
