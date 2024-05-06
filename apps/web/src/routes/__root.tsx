import Alert from "@hominem/components/Alert";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";

import Footer from "src/components/Footer";
import Header from "src/components/Header";
import NotFound from "src/components/NotFound";
import Toast from "src/components/Toast";
import { type AuthContext, useAuth } from "src/services/auth";

export interface RouterContext {
	auth: AuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	notFoundComponent: () => <NotFound />,
	errorComponent: ({ error }) => {
		console.error(error);
		return <Alert type="error">Something went wrong</Alert>;
	},
	component: () => {
		const user = Route.useLoaderData();
		const { setCurrentLocation } = useAuth();

		/* biome-ignore lint/correctness/useExhaustiveDependencies: This is intentional */
		useEffect(() => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position: GeolocationPosition) => {
						setCurrentLocation({
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
						});
					},
				);
			} else {
				// !TODO Browser doesn't support Geolocation
				// handleLocationError(false, infoWindow, map.getCenter()!);
			}
		}, []);

		return (
			<>
				<div className="h-full w-full flex flex-col items-center">
					<div className="h-full w-full flex flex-col sm:max-w-3xl px-2">
						<Header />
						<main
							data-testid="app-main"
							className="flex flex-1 mt-8 w-full max-sm:pb-16"
						>
							<Outlet />
							<TanStackRouterDevtools />
						</main>
						<Toast />
						{!!user && <Footer />}
					</div>
				</div>
			</>
		);
	},
});
