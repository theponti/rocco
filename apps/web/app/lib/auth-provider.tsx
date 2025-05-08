import { useAuth } from "@clerk/react-router";
import { type ReactNode, useEffect } from "react";
import { setTokenProvider } from "./api/base";

/**
 * AuthProvider component that sets up the authentication token for API requests
 * This component should be rendered near the root of your application
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const { getToken, isSignedIn } = useAuth();

	useEffect(() => {
		if (isSignedIn) {
			// Set the token provider to the Clerk getToken function
			// This will be used by the API interceptor to add the token to requests
			setTokenProvider(getToken());
		} else {
			// Clear the token provider when the user is not signed in
			setTokenProvider(Promise.resolve(null));
		}
	}, [isSignedIn, getToken]);

	return <>{children}</>;
}
