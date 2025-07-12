import Redis from "ioredis";

// Redis configuration
const redisConfig = {
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379"),
	password: process.env.REDIS_PASSWORD || "redis_password",
	retryDelayOnFailover: 100,
	maxRetriesPerRequest: 3,
	lazyConnect: true,
	keepAlive: 30000,
	connectTimeout: 10000,
	commandTimeout: 5000,
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Redis client event handlers
redis.on("connect", () => {
	console.log("✅ Redis connected");
});

redis.on("error", (error) => {
	console.error("❌ Redis connection error:", error);
});

redis.on("close", () => {
	console.log("🔌 Redis connection closed");
});

redis.on("reconnecting", () => {
	console.log("🔄 Redis reconnecting...");
});

// Cache utilities
export const cacheUtils = {
	// Set cache with TTL
	async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
		try {
			const serializedValue = JSON.stringify(value);
			await redis.setex(key, ttlSeconds, serializedValue);
		} catch (error) {
			console.error("Redis set error:", error);
		}
	},

	// Get cache value
	async get<T>(key: string): Promise<T | null> {
		try {
			const value = await redis.get(key);
			if (value) {
				return JSON.parse(value) as T;
			}
			return null;
		} catch (error) {
			console.error("Redis get error:", error);
			return null;
		}
	},

	// Delete cache key
	async del(key: string): Promise<void> {
		try {
			await redis.del(key);
		} catch (error) {
			console.error("Redis del error:", error);
		}
	},

	// Delete multiple cache keys
	async delMultiple(keys: string[]): Promise<void> {
		try {
			if (keys.length > 0) {
				await redis.del(...keys);
			}
		} catch (error) {
			console.error("Redis delMultiple error:", error);
		}
	},

	// Clear all cache (use with caution)
	async clearAll(): Promise<void> {
		try {
			await redis.flushall();
		} catch (error) {
			console.error("Redis clearAll error:", error);
		}
	},

	// Get cache statistics
	async getStats(): Promise<{ keys: number; memory: string }> {
		try {
			const info = await redis.info("memory");
			const keys = await redis.dbsize();

			// Parse memory info
			const memoryMatch = info.match(/used_memory_human:(\S+)/);
			const memory = memoryMatch ? memoryMatch[1] : "unknown";

			return { keys, memory };
		} catch (error) {
			console.error("Redis stats error:", error);
			return { keys: 0, memory: "unknown" };
		}
	},
};

// Cache key generators
export const cacheKeys = {
	user: (supabaseId: string) => `user:${supabaseId}`,
	token: (token: string) => `token:${token}`,
	list: (listId: string) => `list:${listId}`,
	place: (placeId: string) => `place:${placeId}`,
	userLists: (userId: string) => `user_lists:${userId}`,
};

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
	try {
		await redis.quit();
		console.log("Redis connection closed gracefully");
	} catch (error) {
		console.error("Error closing Redis connection:", error);
	}
};
