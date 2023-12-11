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
                accepted: { type: "boolean" },
                listId: { type: "string" },
                invitedUserEmail: { type: "string" },
                invitedUserId: { type: "string" },
                // The user who created the invite
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                    name: { type: "string" },
                  },
                },
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
