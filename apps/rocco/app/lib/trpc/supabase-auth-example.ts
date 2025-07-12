// Example of how to integrate Supabase auth with tRPC context
// This is a reference implementation - you'll need to adapt it to your setup

import { createClient } from "@supabase/supabase-js";
import { httpBatchLink } from "@trpc/client";
import { db } from "../../db";
import { trpc } from "./client";

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Example of how to update the createContext function
export async function createContextWithSupabase(request?: Request) {
	// Get the authorization header
	const authHeader = request?.headers.get("authorization");

	if (!authHeader) {
		return { db, user: undefined };
	}

	try {
		// Verify the JWT token with Supabase
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

		if (error || !user) {
			return { db, user: undefined };
		}

		// Return context with user information
		return {
			db,
			user: {
				id: user.id,
				email: user.email || "",
				name: user.user_metadata?.name,
				avatar: user.user_metadata?.avatar_url,
				isAdmin: user.user_metadata?.isAdmin || false,
			},
		};
	} catch (error) {
		console.error("Error verifying auth token:", error);
		return { db, user: undefined };
	}
}

// Example of how to update the tRPC client to include auth headers
export function createTRPCClientWithAuth() {
	return trpc.createClient({
		links: [
			httpBatchLink({
				url: "/api/trpc",
				async headers() {
					// Get the current session from Supabase
					const {
						data: { session },
					} = await supabase.auth.getSession();

					return {
						authorization: session?.access_token
							? `Bearer ${session.access_token}`
							: "",
					};
				},
			}),
		],
	});
}
