import { createServer } from "../../server";
import { FastifyInstance } from "fastify";
import { mockAuthSession } from "../../test.utils";

describe("/lists", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createServer({ logger: false });
    jest.spyOn(server.prisma.list, "findMany").mockResolvedValue([]);
    jest.spyOn(server.prisma.userLists, "findMany").mockResolvedValue([]);
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
        url: "/lists",
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });
  });

  describe("POST /lists", () => {
    test("returns 200", async () => {
      mockAuthSession();
      (server.prisma.list.create as jest.Mock).mockResolvedValue({
        id: "testListId",
        name: "My List",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const response = await server.inject({
        method: "POST",
        url: "/lists",
        payload: {
          name: "My List",
        },
      });
      expect(server.prisma.list.create).toHaveBeenCalledWith({
        data: { name: "My List", userId: "testUserId" },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty("list");
      expect(response.json().list).toHaveProperty("id");
      expect(response.json().list).toHaveProperty("name");
      expect(response.json().list).toHaveProperty("createdAt");
      expect(response.json().list).toHaveProperty("updatedAt");
    });
  });

  describe("POST /lists/place", () => {
    it("should create a place and associate it with lists", async () => {
      mockAuthSession();
      const payload = {
        listIds: ["listId1", "listId2"],
        place: {
          name: "Test Place",
          address: "Test Address",
          googleMapsId: "TestPlaceID",
          latitude: 40.7128,
          longitude: -74.006,
          types: ["type1", "type2"],
          imageUrl: "Test Image URL",
          websiteUri: "Test Website URI",
        },
      };
      const createdAt = new Date();
      const updatedAt = new Date();
      const dates = { createdAt, updatedAt };
      const stringDates = {
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      };
      (server.prisma.place.create as jest.Mock).mockResolvedValue({
        ...payload.place,
        ...dates,
        id: "testPlaceId",
        description: "",
      });
      (server.prisma.list.findMany as jest.Mock).mockResolvedValue([
        {
          id: "listId1",
          name: "List 1",
          ...dates,
        },
        {
          id: "listId2",
          name: "List 2",
          ...dates,
        },
      ]);
      (server.prisma.item.createMany as jest.Mock).mockResolvedValue({
        id: "testItemId",
        name: "Test Item",
        description: "",
        placeId: "testPlaceId",
        listId: "listId1",
        ...dates,
      });
      const response = await server.inject({
        method: "POST",
        url: "/lists/place",
        payload,
      });

      expect(server.prisma.place.create).toHaveBeenCalledWith({
        data: {
          ...payload.place,
          description: "",
          createdBy: {
            connect: {
              id: "testUserId",
            },
          },
        },
      });
      expect(server.prisma.list.findMany).toHaveBeenCalledWith({
        where: { id: { in: ["listId1", "listId2"] } },
      });
      expect(server.prisma.item.createMany).toHaveBeenCalledWith({
        data: [
          {
            type: "PLACE",
            itemId: "testPlaceId",
            listId: "listId1",
          },
          {
            type: "PLACE",
            itemId: "testPlaceId",
            listId: "listId2",
          },
        ],
        skipDuplicates: true,
      });

      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toEqual(
        expect.objectContaining({
          place: expect.objectContaining({
            id: "testPlaceId",
            description: "",
            ...payload.place,
            ...stringDates,
          }),
          lists: expect.arrayContaining([
            expect.objectContaining({
              id: "listId1",
              name: "List 1",
              ...stringDates,
            }),
            expect.objectContaining({
              id: "listId2",
              name: "List 2",
              ...stringDates,
            }),
          ]),
        }),
      );
    });
  });
});
