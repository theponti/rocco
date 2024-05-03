import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import { APP_NAME } from "src/services/constants";
import { LANDING, LOGIN } from "src/services/constants/routes";
import { useAuth } from "src/services/hooks";

import AuthNavMenu from "./AuthNavMenu";

function Header() {
	const { isAuthenticated, user } = useAuth();

	return (
		<header className="navbar flex flex-row justify-between items-center pt-4 px-0">
			<Link
				to={LANDING}
				className="flex gap-2 items-center font-extrabold lowercase text-4xl py-1"
			>
				<Globe className="animate-spin-slow mt-1 size-7 text-primary" />
				{APP_NAME}
			</Link>
			{isAuthenticated ? (
				<AuthNavMenu user={user} />
			) : (
				<Link to={LOGIN} className="btn btn-primary text-white">
					Log In
				</Link>
			)}
		</header>
	);
}

export default Header;
