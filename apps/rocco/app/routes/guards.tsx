import { redirect } from "react-router";
import { useAuth } from "../lib/auth-provider";
import { supabase } from "../lib/supabase";

/**
 * Auth guard for loaders - redirects to login if user is not authenticated
 * @param request The request object
 * @returns An object with authenticated user information
 */
export async function requireAuth(loaderArgs: any) {
	// Get the session from the request
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user) {
		const url = new URL(loaderArgs.request.url);
		const redirectTo = url.pathname + url.search;
		return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return {
		userId: session.user.id,
		user: session.user,
		session,
		getToken: async () => session.access_token,
	};
}

/**
 * Auth guard component for client-side route protection
 * Renders children only if user is authenticated
 */
export function AuthRequired({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <div>Loading authentication...</div>;
	}

	if (!user) {
		return redirect("/login");
	}

	return <>{children}</>;
}

/**
 * Guard to restrict access to guests only (not authenticated users)
 * @param request The request object
 * @returns Redirects to dashboard if user is already authenticated
 */
export async function requireGuest(request: Request) {
	const auth = useAuth();

	if (auth.userId) {
		return redirect("/dashboard");
	}

	return { isGuest: true };
}
