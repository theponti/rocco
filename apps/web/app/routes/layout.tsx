import { useAuth } from "@clerk/react-router";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { LoadingScreen } from "~/components/Loading";
import Toast from "~/components/Toast";

export default function Layout() {
	const { isLoaded, userId } = useAuth();
	const isAuthenticated = isLoaded && userId;
	const location = useLocation();
	const isHome = location.pathname === "/";

	return (
		<div className="h-full w-full flex flex-col items-center bg-[#0d0c22]">
			<Header />

			<main
				data-testid="app-main"
				className="w-full lg:container lg:mx-auto mt-26 flex flex-col grow"
			>
				{!isLoaded ? (
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
