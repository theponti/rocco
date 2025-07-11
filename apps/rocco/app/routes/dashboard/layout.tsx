import { Outlet } from "react-router";
import { PlaceProvider } from "../place/place-context";

export const DashboardLayout = () => {
	return (
		<PlaceProvider>
			<Outlet />
		</PlaceProvider>
	);
};
