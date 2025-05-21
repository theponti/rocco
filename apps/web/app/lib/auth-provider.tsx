import { useAuth, useClerk } from "@clerk/react-router";
import { type ReactNode, useEffect } from "react";
import { setTokenProvider } from "./api/base";

/**
 * AuthProvider component that sets up the authentication token for API requests
 * This component should be rendered near the root of your application
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const { isSignedIn } = useAuth();
	const clerk = useClerk();

	useEffect(() => {
		const noop = () => Promise.resolve(null);
		setTokenProvider(
			isSignedIn && clerk.session ? clerk.session.getToken : noop,
		);
	}, [isSignedIn, clerk]);

	return <>{children}</>;
}
