import type { Dispatch, SetStateAction } from "react";

export type LocalStorageAuthState = {
	// Add your properties here
	email?: string;
	// Add any other properties that should be in this type
} | null;

export interface AuthState {
	authState: LocalStorageAuthState;
	setAuthState: Dispatch<SetStateAction<LocalStorageAuthState>>;
}

// Simple hook to mimic v7 AuthProvider behavior
export function useAuth() {
	return {
		isLoaded: true,
		isSignedIn: false,
		user: null,
		isPending: false
	};
}
