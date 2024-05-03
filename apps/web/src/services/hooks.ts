import { useCallback, useEffect, useRef } from "react";

import type { AuthStatus, User } from "./auth";
import { type RootState, useAppDispatch, useAppSelector } from "./store";

export const getIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const getLoginEmail = (state: RootState) => state.auth.loginEmail;
export const getIsAuthenticated = (state: RootState) => !!state.auth.user;

export type AuthContext = {
	dispatch: ReturnType<typeof useAppDispatch>;
	isAuthenticated: boolean;
	isLoadingAuth: boolean;
	loginEmail: string | null;
	status: AuthStatus;
	user: User | null;
};

export const useAuth = (): AuthContext => {
	const user = useAppSelector((state: RootState) => state.auth.user);
	const isLoadingAuth = useAppSelector(getIsLoadingAuth);
	const loginEmail = useAppSelector(getLoginEmail);
	const status = useAppSelector((state: RootState) => state.auth.status);
	const dispatch = useAppDispatch();

	return {
		dispatch,
		isAuthenticated: !!user,
		isLoadingAuth,
		loginEmail,
		status,
		user,
	};
};

export const useMountedState = () => {
	const isMountedRef = useRef<boolean>(false);
	const isMounted = useCallback(() => isMountedRef.current, []);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return isMounted;
};
