import { ClerkProvider } from "@clerk/react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./index.css";
import { queryClient } from "./lib/api/base";
import { AuthProvider } from "./lib/auth-provider";
import { store } from "./lib/store";

export const links: Route.LinksFunction = () => [
	{ rel: "icon", href: "/favicons/favicon.ico" },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

process.env.VITE_CLERK_PUBLISHABLE_KEY =
	import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
process.env.CLERK_SECRET_KEY = import.meta.env.VITE_CLERK_SECRET_KEY;

export async function loader(args: Route.LoaderArgs) {
	return rootAuthLoader(args);
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export default function App({
	loaderData,
}: { loaderData: Route.ComponentProps }) {
	return (
		<ClerkProvider
			publishableKey={PUBLISHABLE_KEY}
			loaderData={loaderData}
			signInFallbackRedirectUrl="/"
			signUpFallbackRedirectUrl="/"
		>
			<Provider store={store}>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<Outlet />
					</AuthProvider>
				</QueryClientProvider>
			</Provider>
		</ClerkProvider>
	);
}
