import Alert from "@hominem/components/Alert";
import Loading from "@hominem/components/Loading";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";

import Footer from "src/components/Footer";
import Header from "src/components/Header";
import NotFound from "src/components/NotFound";
import Toast from "src/components/Toast";
import { loadAuth } from "src/services/auth";
import { setCurrentLocation } from "src/services/auth";
import { type AuthContext, useAuth } from "src/services/hooks";
import { useAppDispatch } from "src/services/store";

export interface MyRouterContext {
	// The ReturnType of your useAuth hook or the value of your AuthContext
	auth: AuthContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	notFoundComponent: () => <NotFound />,
	errorComponent: ({ error }) => {
		console.error(error);
		return <Alert type="error">Something went wrong</Alert>;
	},
	component: () => {
		const dispatch = useAppDispatch();

		/* biome-ignore lint/correctness/useExhaustiveDependencies: This is intentional */
		useEffect(() => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position: GeolocationPosition) => {
						dispatch(
							setCurrentLocation({
								latitude: position.coords.latitude,
								longitude: position.coords.longitude,
							}),
						);
					},
				);
			} else {
				// !TODO Browser doesn't support Geolocation
				// handleLocationError(false, infoWindow, map.getCenter()!);
			}
		}, []);

		if (status === "loading") {
			return (
				<div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
					<Loading size="xl" />
				</div>
			);
		}

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
						{/* {isAuthenticated && <Footer />} */}
					</div>
				</div>
			</>
		);
	},
});
