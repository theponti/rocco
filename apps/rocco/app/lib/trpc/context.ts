import { TRPCError, initTRPC } from "@trpc/server";
import { db } from "../../db";
import { createClient } from "../../lib/supabase/server";
import { logger } from "../logger";
import { cacheKeys, cacheUtils } from "../redis";

// Define the context shape
export interface Context {
	db: typeof db;
	user?: {
		id: string;
		email: string;
		name?: string;
		avatar?: string;
		isAdmin?: boolean;
		supabaseId: string;
	};
}

// Cache TTL constants
const TOKEN_CACHE_TTL = 1 * 60; // 1 minute

// Optimized token validation with Redis caching
async function validateTokenWithCache(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (!authHeader) {
		return null;
	}

	const token = authHeader.replace("Bearer ", "");

	// Try to get from cache first
	const cacheKey = cacheKeys.token(token);
	const cachedToken = await cacheUtils.get<any>(cacheKey);

	if (cachedToken) {
		return cachedToken;
	}

	// Create Supabase client for server-side auth verification
	const { supabase } = createClient(request);

	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			return null;
		}

		// Cache the token validation result
		await cacheUtils.set(cacheKey, user, TOKEN_CACHE_TTL);

		return user;
	} catch (error) {
		logger.error("Error validating token", { error: error as Error });
		return null;
	}
}

export const createContext = async (request?: Request): Promise<Context> => {
	if (!request) {
		return { db };
	}

	try {
		// Validate token with caching
		const supabaseUser = await validateTokenWithCache(request);

		if (!supabaseUser) {
			return { db };
		}

		logger.debug("User authenticated", {
			userId: supabaseUser.id,
			email: supabaseUser.email,
		});

		// Return context with user information from Supabase
		return {
			db,
			user: {
				id: supabaseUser.id,
				email: supabaseUser.email || "",
				name:
					supabaseUser.user_metadata?.name ||
					supabaseUser.user_metadata?.full_name,
				avatar: supabaseUser.user_metadata?.avatar_url,
				isAdmin: supabaseUser.user_metadata?.isAdmin || false,
				supabaseId: supabaseUser.id,
			},
		};
	} catch (error) {
		logger.error("Error verifying auth token", { error: error as Error });
		return { db };
	}
};

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be logged in to access this resource",
		});
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user,
		},
	});
});

// Middleware to check if user is admin
const isAdmin = t.middleware(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be logged in to access this resource",
		});
	}
	if (!ctx.user.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You must be an admin to access this resource",
		});
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user,
		},
	});
});

// Export protected procedures
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);

// Cache management utilities
export const clearTokenCache = async (token?: string) => {
	if (token) {
		await cacheUtils.del(cacheKeys.token(token));
	} else {
		// Clear all token cache keys (use with caution)
		console.warn("Clearing all token cache - this is expensive in production");
	}
};

// Cache statistics utility
export const getCacheStats = async () => {
	return await cacheUtils.getStats();
};
