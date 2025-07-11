import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in environment variables");
}

// Create the postgres client
const client = postgres(process.env.DATABASE_URL, {
	max: 10, // Maximum number of connections
	idle_timeout: 20, // Close idle connections after 20 seconds
	connect_timeout: 10, // Connection timeout of 10 seconds
});

// Create the drizzle database instance
export const db = drizzle(client, { schema });

// Export the client for manual queries if needed
export { client };

// Export schema for use in other parts of the app
    export * from "./schema";
