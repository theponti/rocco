import type { PropsWithChildren } from "react";
import { Link, useMatches } from "react-router";
import { twMerge } from "tailwind-merge";

const AppLink = ({
	btn,
	to,
	className,
	children,
	...props
}: PropsWithChildren<
	React.HTMLProps<HTMLAnchorElement> & {
		btn?: boolean;
		className?: string;
		to: string;
	}
>) => {
	const matches = useMatches();
	const isActive = matches.some(match => match.pathname === to);

	if (btn) {
		return (
			<Link to={to} {...props}>
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

	return (
		<Link
			to={to}
			className={twMerge(
				"text-black",
				isActive ? "bg-blue-100" : null,
				className,
			)}
			{...props}
		>
			{children}
		</Link>
	);
};

export default AppLink;
