import "dotenv/config";
import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in .env file");
}

export default {
	schema: "./app/db/schema.ts",
	out: "./app/db",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
	verbose: true,
	strict: true,
	schemaFilter: ["public"],
} satisfies Config;
