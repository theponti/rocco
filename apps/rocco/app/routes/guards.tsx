import { type LoaderFunctionArgs, data, redirect } from "react-router";
import { createClient } from "../lib/supabase/server";

/**
 * Auth guard for loaders - redirects to login if user is not authenticated
 * @param request The request object
 * @returns An object with authenticated user information
 */
export async function requireAuth(loaderArgs: LoaderFunctionArgs) {
	const { supabase } = createClient(loaderArgs.request);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user) {
		throw data("Unauthenticated", { status: 401 });
	}

	return {
		userId: session.user.id,
		user: session.user,
		session,
		getToken: async () => session.access_token,
	};
}

/**
 * Guard to restrict access to guests only (not authenticated users)
 * @param request The request object
 * @returns Redirects to dashboard if user is already authenticated
 */
export async function requireGuest(loaderArgs: LoaderFunctionArgs) {
	const { supabase } = createClient(loaderArgs.request);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session?.user) {
		return redirect("/dashboard");
	}

	return { isGuest: true };
}
