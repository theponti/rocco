import { createClient } from "@supabase/supabase-js";
import { TRPCError, initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
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
const USER_CACHE_TTL = 5 * 60; // 5 minutes
const TOKEN_CACHE_TTL = 1 * 60; // 1 minute

// Create Supabase client for server-side auth verification
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
	supabaseUrl && supabaseServiceKey
		? createClient(supabaseUrl, supabaseServiceKey)
		: null;

// Get user from cache or database
async function getUserFromCacheOrDB(supabaseId: string) {
	// Try to get from cache first
	const cacheKey = cacheKeys.user(supabaseId);
	const cachedUser = await cacheUtils.get<any>(cacheKey);

	if (cachedUser) {
		return cachedUser;
	}

	// Fetch from database
	const user = await db.query.users.findFirst({
		where: eq(users.supabaseId, supabaseId),
	});

	if (user) {
		// Cache the user data
		await cacheUtils.set(cacheKey, user, USER_CACHE_TTL);
	}

	return user;
}

// Optimized token validation with Redis caching
async function validateTokenWithCache(token: string) {
	// Try to get from cache first
	const cacheKey = cacheKeys.token(token);
	const cachedToken = await cacheUtils.get<any>(cacheKey);

	if (cachedToken) {
		return cachedToken;
	}

	if (!supabase) {
		return null;
	}

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
		console.error("Error validating token:", error);
		return null;
	}
}

export const createContext = async (request?: Request): Promise<Context> => {
	const authHeader = request?.headers.get("authorization");
	if (!authHeader) {
		return { db };
	}

	try {
		const token = authHeader.replace("Bearer ", "");

		// Validate token with caching
		const supabaseUser = await validateTokenWithCache(token);

		if (!supabaseUser) {
			return { db };
		}

		// Get local user data from cache or database
		const localUser = await getUserFromCacheOrDB(supabaseUser.id);

		// Return context with user information
		return {
			db,
			user: {
				id: localUser?.id || supabaseUser.id,
				email: localUser?.email || supabaseUser.email || "",
				name:
					localUser?.name ||
					supabaseUser.user_metadata?.name ||
					supabaseUser.user_metadata?.full_name,
				avatar: localUser?.photoUrl || supabaseUser.user_metadata?.avatar_url,
				isAdmin:
					localUser?.isAdmin || supabaseUser.user_metadata?.isAdmin || false,
				supabaseId: supabaseUser.id,
			},
		};
	} catch (error) {
		console.error("Error verifying auth token:", error);
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

// Protected procedure that extracts and returns the user
export const userProcedure = protectedProcedure.query(async ({ ctx }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not found in context",
		});
	}

	return {
		id: ctx.user.id,
		email: ctx.user.email,
		name: ctx.user.name,
		avatar: ctx.user.avatar,
		isAdmin: ctx.user.isAdmin,
		supabaseId: ctx.user.supabaseId,
	};
});

// Cache management utilities
export const clearUserCache = async (supabaseId?: string) => {
	if (supabaseId) {
		await cacheUtils.del(cacheKeys.user(supabaseId));
	} else {
		// Clear all user cache keys (use with caution)
		// In production, you might want to use Redis SCAN to find and delete specific patterns
		console.warn("Clearing all user cache - this is expensive in production");
	}
};

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
