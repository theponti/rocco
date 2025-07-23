import { Suspense } from "react";
import { Outlet, useLoaderData, useLocation } from "react-router";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { LoadingScreen } from "~/components/loading";
import MapLayout from "~/components/map-layout";
import { Toaster } from "~/components/ui/toaster";
import { createClient } from "~/lib/supabase/server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
	const { supabase } = createClient(request);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return {
		user: user || null,
		isAuthenticated: !!user,
	};
}

export default function Layout() {
	const { user, isAuthenticated } = useLoaderData<typeof loader>();
	const location = useLocation();
	const isHome = location.pathname === "/";

	// For authenticated users on non-home pages, use the map layout
	if (isAuthenticated && !isHome) {
		return (
			<div className="h-screen w-full flex flex-col overflow-hidden">
				<Header isAuthenticated={isAuthenticated} />
				<div className="flex-1 flex overflow-hidden mt-20">
					<MapLayout>
						<Suspense fallback={<LoadingScreen />}>
							<Outlet />
						</Suspense>
					</MapLayout>
				</div>
				<Toaster />
			</div>
		);
	}

	// For home page and unauthenticated users, use the original layout
	return (
		<div className="h-full w-full flex flex-col items-center">
			<Header isAuthenticated={isAuthenticated} />

			<main
				data-testid="app-main"
				className="w-full max-w-5xl mx-auto mt-24 flex flex-col px-2 sm:px-0"
			>
				<Suspense fallback={<LoadingScreen />}>
					<Outlet />
				</Suspense>
				<Toaster />
			</main>

			{isAuthenticated && !isHome && <Footer />}
		</div>
	);
}
