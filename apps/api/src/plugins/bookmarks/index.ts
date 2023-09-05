import { FastifyInstance, FastifyPluginAsync } from "fastify";

import { getOpenGraphData } from "./utils";

type LinkType = {
  image: string;
  title: string;
  description: string;
  url: string;
  siteName: string;
  imageWidth: string;
  imageHeight: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export type SpotifyLink = LinkType & {
  type: "spotify";
  spotifyId: string;
};

export type AirbnbLink = LinkType & {
  type: "airbnb";
  airbnbId: string;
};

const bookmarkSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    image: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    url: { type: "string" },
    siteName: { type: "string" },
    imageWidth: { type: "string" },
    imageHeight: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const authPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get(
    "/bookmarks",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: bookmarkSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const session = request.session.get("data");

      if (!session) {
        return reply.code(401).send();
      }

      const bookmarks = await prisma.recommendation.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

      return bookmarks;
    },
  );

  server.post(
    "/bookmarks",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            url: { type: "string" },
          },
          required: ["url"],
        },
        response: {
          200: bookmarkSchema,
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const { url } = request.body as { url: string };
      const { userId } = request.session.get("data");

      try {
        const ogContent = await getOpenGraphData({ url });
        const recommendation = {
          image: ogContent.imageUrl,
          title: ogContent.title,
          description: ogContent.description,
          url,
          siteName: ogContent.siteName,
          imageWidth: ogContent.imageWidth,
          imageHeight: ogContent.imageHeight,
        };

        const obj = await prisma.recommendation.create({
          data: {
            ...recommendation,
            userId,
          },
        });
        return { recommendation: obj };
      } catch (err) {
        return reply
          .code(500)
          .send({ message: "Recommendation could not be created" });
      }
    },
  );

  server.put(
    "/bookmarks/:id",
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
            url: { type: "string" },
          },
          required: ["url"],
        },
        response: {
          200: bookmarkSchema,
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const { url } = request.body as { url: string };
      const { userId } = request.session.get("data");

      try {
        const ogContent = await getOpenGraphData({ url });
        const recommendation = {
          image: ogContent.imageUrl,
          title: ogContent.title,
          description: ogContent.description,
          url,
          siteName: ogContent.siteName,
          imageWidth: ogContent.imageWidth,
          imageHeight: ogContent.imageHeight,
        };

        const obj = await prisma.recommendation.update({
          where: { id, userId },
          data: recommendation,
        });
        return { recommendation: obj };
      } catch (err) {
        return reply
          .code(500)
          .send({ message: "Recommendation could not be updated" });
      }
    },
  );

  server.delete(
    "/bookmarks/:id",
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
          200: bookmarkSchema,
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const { userId } = request.session.get("data");

      await prisma.recommendation.delete({
        where: { id, userId },
      });

      reply.code(200).send(null);
    },
  );
};

export default authPlugin;