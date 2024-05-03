import { type FileRoutesByPath, Link, useMatch } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

const NavLink = ({
	href,
	className,
	children,
}: PropsWithChildren<{ className?: string; href: keyof FileRoutesByPath }>) => {
	return (
		<Link
			to={href}
			className={twMerge(
				"text-black",
				useMatch({ from: href }) ? "bg-blue-100" : null,
				className,
			)}
		>
			{children}
		</Link>
	);
};

export default NavLink;
