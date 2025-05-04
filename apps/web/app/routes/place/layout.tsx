import { APIProvider } from "@vis.gl/react-google-maps";
import { Outlet } from "react-router";
import { PlaceProvider } from "./place-context";

export const PlaceLayout = () => {
	return (
		<PlaceProvider>
			<APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
				<Outlet />
			</APIProvider>
		</PlaceProvider>
	);
};
