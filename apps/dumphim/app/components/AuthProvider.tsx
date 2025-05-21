import type { Session, User } from "@supabase/supabase-js";
import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { supabase } from "~/lib/supabaseClient";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	signInWithPassword: typeof supabase.auth.signInWithPassword;
	signUp: typeof supabase.auth.signUp;
	signOut: typeof supabase.auth.signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
			setIsLoading(false);
		});

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (_event, newSession) => {
				setSession(newSession);
				setUser(newSession?.user ?? null);
				setIsLoading(false);
			},
		);

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, []);

	const value = {
		user,
		session,
		isLoading,
		signInWithPassword: supabase.auth.signInWithPassword,
		signUp: supabase.auth.signUp,
		signOut: supabase.auth.signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
