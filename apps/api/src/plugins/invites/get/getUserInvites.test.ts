import { FastifyInstance } from "fastify";
import { createServer } from "../../../server";
import { mockAuthSession } from "../../../test.utils";

describe("GET /invites", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return users' incoming invites", async () => {
    mockAuthSession();
    (server.prisma.listInvite.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await server.inject({
      method: "GET",
      url: "/invites",
    });

    expect(server.prisma.listInvite.findMany).toHaveBeenCalledWith({
      where: { invitedUserId: "testUserId" },
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual([]);
  });

  it("should return users' outgoing invites", async () => {
    mockAuthSession();
    (server.prisma.listInvite.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await server.inject({
      method: "GET",
      url: "/invites/outgoing",
    });

    expect(server.prisma.listInvite.findMany).toHaveBeenCalledWith({
      where: { userId: "testUserId" },
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual([]);
  });
});
