jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    list: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    place: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    item: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
  })),
}));

jest.mock("./analytics", () => ({
  track: jest.fn(),
}));
