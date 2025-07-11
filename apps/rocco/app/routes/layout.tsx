import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { LoadingScreen } from "~/components/loading";
import Toast from "~/components/toast";
import { useAuth } from "~/lib/auth-provider";

export default function Layout() {
	const { user, isLoading } = useAuth();
	const isAuthenticated = !isLoading && user;
	const location = useLocation();
	const isHome = location.pathname === "/";

	return (
		<div className="h-full w-full flex flex-col items-center">
			<Header />

			<main
				data-testid="app-main"
				className="w-full lg:container lg:mx-auto mt-26 flex flex-col grow"
			>
				{isLoading ? (
					<LoadingScreen />
				) : (
					<Suspense fallback={<LoadingScreen />}>
						<Outlet />
					</Suspense>
				)}
				<Toast />
			</main>

			{isAuthenticated && !isHome && <Footer />}
		</div>
	);
}
