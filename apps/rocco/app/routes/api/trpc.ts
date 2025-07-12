import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "../../lib/trpc/context";
import { appRouter } from "../../lib/trpc/router";
import type { Route } from "./+types/trpc";

export const loader = ({ request }: Route.LoaderArgs) => {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req: request,
		router: appRouter,
		createContext: async (opts) => createContext(opts.req),
		onError:
			process.env.NODE_ENV === "development"
				? ({ path, error }) => {
						console.error(
							`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
						);
					}
				: undefined,
	});
};
