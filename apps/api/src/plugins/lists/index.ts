import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import getListsRoute from "./get";
import { verifySession } from "../auth";
import postListsPlace from "./post/place";

// Example router with queries that can only be hit if the user requesting is signed in
const listsPlugin: FastifyPluginAsync = async (server) => {
  getListsRoute(server);
  postListsPlace(server);

  server.post(
    "/lists",
    {
      preValidation: verifySession,
      schema: {
        body: {
          name: {
            type: "string",
            minLength: 3,
            maxLength: 50,
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              list: {
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
      },
    },
    async (request) => {
      const { prisma } = server;
      const { name } = request.body as { name: string };
      const { userId } = request.session.get("data");
      const list = await prisma.list.create({
        data: {
          name,
          userId,
        },
      });
      return { list };
    },
  );

  server.delete(
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
              list: {
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
      },
    },
    async (request) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const list = await prisma.list.delete({
        where: { id },
      });
      return { list };
    },
  );

  server.put(
    "/lists/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              list: {
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
      },
    },
    async (request) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const { name } = request.body as { name: string };
      const list = await prisma.list.update({
        where: { id },
        data: { name },
      });
      return { list };
    },
  );
};

export default fastifyPlugin(listsPlugin);
