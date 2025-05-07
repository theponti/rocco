import { Outlet } from "react-router";
import { PlaceProvider } from "./place-context";

export const PlaceLayout = () => {
	console.log("PlaceLayout");
	return (
		<PlaceProvider>
			<Outlet />
		</PlaceProvider>
	);
};
