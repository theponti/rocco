import { useAuth } from "@clerk/react-router";
import Footer from "app/components/Footer";
import Header from "app/components/Header";
import Toast from "app/components/Toast";
import { Suspense } from "react";
import { Outlet } from "react-router";
import { LoadingScreen } from "~/components/Loading";

export default function Layout() {
	const { isLoaded, userId } = useAuth();
	const isAuthenticated = isLoaded && userId;

	return (
		<div className="h-full w-full flex flex-col items-center">
			<div className="h-full w-full flex flex-col sm:max-w-3xl px-2">
				<Header />
				<main
					data-testid="app-main"
					className="flex mt-8 w-full max-md:pb-16 pb-12"
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
			</div>
			{isAuthenticated && <Footer />}
		</div>
	);
}
