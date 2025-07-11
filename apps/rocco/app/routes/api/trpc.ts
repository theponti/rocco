import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "../../lib/trpc/context";
import { appRouter } from "../../lib/trpc/router";

const handler = (request: Request) => {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req: request,
		router: appRouter,
		createContext: async (opts) => createContext(opts.req),
		onError:
			process.env.NODE_ENV === "development"
				? ({ path, error }) => {
						console.error(
							`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
						);
				  }
				: undefined,
	});
};

export { handler as GET, handler as POST };
