import { useAuth, useClerk, useUser } from "@clerk/react-router";
import styled from "@emotion/styled";
import {
	Globe,
	List,
	LogOut,
	Mail,
	Search,
	Settings,
	UserCircle,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router";

const ACCOUNT = "/account";
const INVITES = "/invites";
const LISTS = "/lists";
const LOGIN = "/login";
const APP_NAME = "rocco";

import AppLink from "app/components/AppLink";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";

const StyledHeader = styled.header`
	& > * {
		min-height: 50px;
	}
`;

function Header() {
	const { isLoaded, userId } = useAuth();
	const { user } = useUser();
	const { signOut } = useClerk();
	const navMenuRef = useRef(null);
	const navigate = useNavigate();

	const onLogoutClick = useCallback(async () => {
		await signOut();
		navigate("/");
	}, [signOut, navigate]);

	return (
		<StyledHeader className="navbar flex flex-row justify-between items-center pt-4 px-0">
			<Link
				to="/"
				className="flex flex-1 gap-2 items-center font-extrabold lowercase text-4xl py-1"
			>
				<Globe className="animate-spin-slow mt-1 size-7 text-primary" />
				{APP_NAME}
			</Link>

			{isLoaded && userId ? (
				<div className="flex-1 justify-end">
					<div className="hidden md:visible md:flex justify-end gap-6 mr-6">
						<AppLink to="/dashboard" className="px-4 py-2 rounded-xl">
							<Search />
						</AppLink>
						<AppLink to={LISTS} className="px-4 py-2 rounded-xl">
							<List />
						</AppLink>
						<AppLink to={INVITES} className="px-4 py-2 rounded-xl">
							<Mail />
						</AppLink>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger
							ref={navMenuRef}
							data-testid="auth-dropdown-button"
							className="btn bg-transparent border-black py-2 px-3"
						>
							<UserCircle />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							data-testid="dropdown-content"
							className="min-w-[200px] w-fit"
						>
							<div className="text-right bg-white text-sm text-gray-400 hover:outline-none pt-2 px-2 pb-3 w-full">
								{user?.emailAddresses?.[0]?.emailAddress}
							</div>
							<DropdownMenuItem>
								<Link to={LISTS} className="flex gap-4 py-2">
									<List size={20} />
									Lists
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link to={INVITES} className="flex gap-4 py-2">
									<Mail size={20} />
									Invites
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link to={ACCOUNT} className="flex gap-4 py-2">
									<Settings size={20} />
									Account
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<button
									type="button"
									className="btn-ghost flex gap-4 py-2"
									onClick={onLogoutClick}
								>
									<LogOut size={20} />
									Logout
								</button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				<Link
					data-testid="header-login-button"
					to={LOGIN}
					className="btn btn-primary text-white"
				>
					Log In
				</Link>
			)}
		</StyledHeader>
	);
}

export default Header;
