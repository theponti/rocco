import { FastifyInstance } from "fastify";

import { verifySession } from "../../../auth";

const getListInvitesRoute = (server: FastifyInstance) => {
  server.get(
    "/lists/:id/invites",
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
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                listId: { type: "string" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const invites = await prisma.listInvite.findMany({
        where: { listId: id },
      });

      return reply.status(200).send(invites);
    },
  );
};

export default getListInvitesRoute;
