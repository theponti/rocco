import { useAuth } from "@clerk/react-router";
import { LoadingScreen } from "app/components/Loading";
import { type ClassValue, clsx } from "clsx";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function withAuth(Component: React.ComponentType) {
	return function AuthComponent(props: any) {
		const { isLoaded, userId } = useAuth();
		const navigate = useNavigate();

		useEffect(() => {
			if (!userId) {
				navigate("/login");
			}
		}, [userId, navigate]);

		if (isLoaded) {
			return <LoadingScreen />;
		}

		return <Component {...props} />;
	};
}
