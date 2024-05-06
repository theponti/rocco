import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import api from "src/services/api";

export interface LoginPayload {
	email: string;
	emailToken: string;
}

export type CurrentLocation = {
	latitude: number;
	longitude: number;
};

export type User = {
	id: string;
	avatar: string;
	email: string;
	name: string;
	isAdmin: string;
	createdAt: string;
	updatedAt: string;
};

export enum AuthStatus {
	Unloaded = "unloaded",
	Loading = "loading",
	Authenticated = "authenticated",
	Unauthenticated = "unauthenticated",
	Error = "error",
}

export interface AuthContext {
	isAuthenticated: boolean;
	currentLocation: CurrentLocation | null;
	loginEmail: string | null;
	status: AuthStatus;
	user?: User;
	loadAuth: () => Promise<User>;
	authenticate: (payload: LoginPayload) => Promise<void>;
	login: (username: string) => Promise<void>;
	logout: () => Promise<void>;
	setUser: (user: User | null) => void;
	setCurrentLocation: (location: CurrentLocation) => void;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>(AuthStatus.Unloaded);
	const [loginEmail, setLoginEmail] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>();
	const [currentLocation, setCurrentLocation] =
		useState<CurrentLocation | null>();
	const isAuthenticated = !!user;

	const loadAuth = async () => {
		const response = await api.get("/me");

		if (!response.data || !response.data.id) {
			throw new Error("User not found");
		}

		return response.data;
	};

	const login = useCallback(async (email: string) => {
		await api.post("/login", { email }, { withCredentials: false });
		setLoginEmail(email);
	}, []);

	const logout = useCallback(async () => {
		await api.post("/logout", {});
		setUser(null);
	}, []);

	const authenticate = useCallback(
		async ({
			email,
			emailToken,
		}: {
			email: string;
			emailToken: string;
		}) => {
			const user = await api.post("/authenticate", { email, emailToken });
			setUser(user.data);
		},
		[],
	);

	return (
		<AuthContext.Provider
			value={{
				currentLocation,
				isAuthenticated,
				loginEmail,
				status,
				user,
				authenticate,
				loadAuth,
				login,
				logout,
				setUser,
				setCurrentLocation,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
