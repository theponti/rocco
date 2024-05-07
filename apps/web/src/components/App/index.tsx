import Loading from "@hominem/components/Loading";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { useAuth } from "src/lib/auth";
import { AuthStatus } from "src/lib/auth/types";
import * as ROUTES from "src/lib/utils/routes";
import LandingPage from "src/scenes/index";
import Login from "src/scenes/login";
import Authenticate from "src/scenes/login/scenes/authenticate";
import NotFound from "src/scenes/not-found";

import AuthenticatedRoutes from "./components/Authenticated";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
	const { status } = useAuth();
	const isAuthenticated = status === AuthStatus.Authenticated;

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
				<Loading size="xl" />
			</div>
		);
	}

	return (
		<div className="h-full w-full flex flex-col items-center">
			<div className="h-full w-full flex flex-col sm:max-w-3xl px-2">
				<Header />
				<main
					data-testid="app-main"
					className="flex flex-1 mt-8 w-full max-sm:pb-16"
				>
					{isAuthenticated ? (
						<AuthenticatedRoutes />
					) : (
						<Routes>
							<Route path={ROUTES.AUTHENTICATE} element={<Authenticate />} />
							<Route path={ROUTES.LOGIN} element={<Login />} />
							<Route path={ROUTES.LANDING} element={<LandingPage />} />
							<Route path={ROUTES.WILDCARD} element={<NotFound />} />
						</Routes>
					)}
				</main>
				{isAuthenticated && <Footer />}
			</div>
		</div>
	);
}

export default App;
