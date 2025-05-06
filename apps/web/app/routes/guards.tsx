import { useAuth } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect } from "react-router";

/**
 * Auth guard for loaders - redirects to login if user is not authenticated
 * @param request The request object
 * @returns An object with authenticated user information
 */
export async function requireAuth(loaderArgs: any) {
	const auth = await getAuth(loaderArgs);

	if (!auth.userId) {
		const url = new URL(loaderArgs.request.url);
		const redirectTo = url.pathname + url.search;
		return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return auth;
}

/**
 * Auth guard component for client-side route protection
 * Renders children only if user is authenticated
 */
export function AuthRequired({ children }: { children: React.ReactNode }) {
	const { isLoaded, userId } = useAuth();

	if (!isLoaded) {
		return <div>Loading authentication...</div>;
	}

	if (!userId) {
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
