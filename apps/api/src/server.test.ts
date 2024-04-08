import type { FastifyInstance } from "fastify";

import { createServer } from "@app/server";

describe("server", () => {
	let server: FastifyInstance;

	beforeAll(async () => {
		server = await createServer({ logger: false });
	});

	afterAll(async () => {
		await server.close();
	});

	test.only("status endpoint returns 200", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/status",
		});
		expect(response.statusCode).toBe(200);
		expect(JSON.parse(response.body)).toEqual({ up: true });
	});
});
