import { RouterProvider, createRouter } from "@tanstack/react-router";
import { APIProvider } from "@vis.gl/react-google-maps";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";

import { useAuth } from "src/services/auth";
import { store } from "src/services/store";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "./services/auth";

const queryClient = new QueryClient();

const router = createRouter({
	routeTree,
	context: {
		auth: undefined,
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
					<AuthProvider>
						<InnerApp />
					</AuthProvider>
				</APIProvider>
			</QueryClientProvider>
		</Provider>
	</React.StrictMode>,
);
