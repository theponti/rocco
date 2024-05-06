import { Link, useNavigate } from "@tanstack/react-router";
import { List, LogOut, Mail, Search, Settings, UserCircle } from "lucide-react";
import { useCallback, useRef } from "react";

import NavLink from "src/components/NavLink";
import { type User, useAuth } from "src/services/auth";
import { LANDING } from "src/services/constants/routes";

const AuthNavMenu = ({ user }: { user: User }) => {
	const navMenuRef = useRef(null);
	const navigate = useNavigate();
	const { logout } = useAuth();
	const onLogoutClick = useCallback(async () => {
		await logout();
		navigate({ to: LANDING });
	}, [logout, navigate]);

	const onLinkClick = useCallback(() => {
		navMenuRef.current?.click?.();
	}, []);

	const onLinkKeyDown = useCallback((event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			navMenuRef.current?.click?.();
		}
	}, []);

	return (
		<>
			<div className="hidden md:visible md:flex gap-6 mr-4">
				<NavLink href="/" className="px-4 py-2 rounded-xl">
					<Search />
				</NavLink>
				<NavLink href="/lists/" className="px-4 py-2 rounded-xl">
					<List />
				</NavLink>
				<NavLink href="/invites/" className="px-4 py-2 rounded-xl">
					<Mail />
				</NavLink>
			</div>
			<div>
				<details data-testid="dropdown" className="dropdown dropdown-end">
					<summary
						ref={navMenuRef}
						data-testid="dropdown-button"
						role="button"
						className="btn bg-transparent border-black"
					>
						<UserCircle />
					</summary>
					<ul
						className="p-1 pb-3 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 mt-1"
						onKeyDown={onLinkKeyDown}
						onClick={onLinkClick}
					>
						<li>
							<span className="flex justify-end text-sm text-secondary hover:outline-none">
								{user.email}
							</span>
						</li>
						<li>
							<Link to="/lists">
								<List size={20} />
								Lists
							</Link>
						</li>
						<li>
							<Link to="/invites">
								<Mail size={20} />
								Invites
							</Link>
						</li>
						<li>
							<Link to="/account">
								<Settings size={20} />
								Account
							</Link>
						</li>
						<li>
							<button
								type="button"
								className="btn-ghost"
								onClick={onLogoutClick}
							>
								<LogOut size={20} />
								Logout
							</button>
						</li>
					</ul>
				</details>
			</div>
		</>
	);
};

export default AuthNavMenu;
