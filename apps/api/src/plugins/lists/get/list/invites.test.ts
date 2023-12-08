// import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";

import { mockAuthSession } from "../../../../test.utils";
import { createServer } from "../../../../server";

describe("/lists", () => {
  let server: FastifyInstance;
  // let prisma: PrismaClient;

  beforeAll(async () => {
    server = await createServer({ logger: false });
    jest.spyOn(server.prisma.list, "findMany").mockResolvedValue([]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await server.close();
  });

  describe("GET /lists", () => {
    test("returns 200", async () => {
      mockAuthSession();
      const response = await server.inject({
        method: "GET",
        url: `/lists/:listId/invites`,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });
  });
});
