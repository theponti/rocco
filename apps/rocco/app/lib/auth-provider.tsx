import type { Session, User } from '@supabase/supabase-js';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { setTokenProvider } from './api/base';
import { supabase } from './supabase';

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	isSignedIn: boolean;
	signInWithPassword: typeof supabase.auth.signInWithPassword;
	signUp: typeof supabase.auth.signUp;
	signOut: typeof supabase.auth.signOut;
	signInWithOAuth: typeof supabase.auth.signInWithOAuth;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		
		// Get initial session
		supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
			setIsLoading(false);
		});

		// Listen for auth changes
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

	// Set up token provider for API requests
	useEffect(() => {
		const tokenProvider = async () => {
			const { data: { session: currentSession } } = await supabase.auth.getSession();
			return currentSession?.access_token || null;
		};
		
		setTokenProvider(tokenProvider);
	}, []);

	const value = {
		user,
		session,
		isLoading,
		isSignedIn: !!user,
		signInWithPassword: supabase.auth.signInWithPassword,
		signUp: supabase.auth.signUp,
		signOut: supabase.auth.signOut,
		signInWithOAuth: supabase.auth.signInWithOAuth,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// Convenience hooks for compatibility with existing code
export const useUser = () => {
	const { user, isLoading } = useAuth();
	return {
		user: user ? {
			id: user.id,
			email: user.email,
			fullName: user.user_metadata?.full_name || user.user_metadata?.name,
			firstName: user.user_metadata?.first_name,
			lastName: user.user_metadata?.last_name,
			primaryEmailAddress: { emailAddress: user.email },
			imageUrl: user.user_metadata?.avatar_url,
		} : null,
		isLoaded: !isLoading,
	};
};


