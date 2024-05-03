import { Link } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export default function LinkButton({
	children,
	className,
	href,
}: PropsWithChildren<{
	className?: string;
	href: string;
}>) {
	return (
		<Link to={href}>
			<span
				className={twMerge(
					"btn btn-primary text-white px-4 py-3 hover:cursor-pointer",
					className,
				)}
			>
				{children}
			</span>
		</Link>
	);
}
