import { z } from "zod";
import { FastifyPluginAsync } from "fastify";
import { verifySession } from "../auth";
import fastifyPlugin from "fastify-plugin";

// Example router with queries that can only be hit if the user requesting is signed in
const listsPlugin: FastifyPluginAsync = async (server) => {
  server.get(
    "/lists",
    {
      preValidation: verifySession,
      schema: {
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          ),
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { userId } = request.session.get("data");
      const lists = await prisma.list.findMany({
        include: {
          createdBy: true,
        },
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return lists;
    },
  );

  server.post(
    "/lists",
    {
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

  // A route to create a new Place and add it to a list
  server.post(
    "/lists/:id/place",
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
            address: { type: "string" },
            location: {
              type: "object",
              properties: {
                lat: { type: "number" },
                lng: { type: "number" },
              },
              required: ["lat", "lng"],
            },
          },
          required: ["name", "address", "location"],
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
      const { name, address, location } = request.body as {
        name: string;
        address: string;
        location: { lat: number; lng: number };
      };

      const place = await prisma.place.create({
        data: {
          name,
          description: "",
          address,
          lat: `${location.lat}`,
          lng: `${location.lng}`,
          createdBy: {
            connect: {
              id: request.session.get("data").userId,
            },
          },
        },
      });

      await prisma.item.create({
        data: {
          type: "PLACE",
          itemId: place.id,
          list: {
            connect: {
              id,
            },
          },
        },
      });

      return { place };
    },
  );
};

export default fastifyPlugin(listsPlugin);
