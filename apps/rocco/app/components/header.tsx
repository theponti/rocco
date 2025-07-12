import { Globe2Icon, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AppLink from "~/components/app-link";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuth } from "~/lib/auth-provider";

const ACCOUNT = "/account";
const INVITES = "/invites";
const LISTS = "/lists";
const APP_NAME = "rocco";

function Header() {
	const { isSignedIn, signOut, signInWithOAuth } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isHome = location.pathname === "/";

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileMenuOpen]);

	const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

	const onLogoutClick = useCallback(async () => {
		await signOut();
		navigate("/");
	}, [signOut, navigate]);

	const SignInButton = () => (
		<Button
			variant="outline"
			onClick={async () => {
				try {
					await signInWithOAuth({
						provider: "google",
						options: {
							redirectTo: `${window.location.origin}/dashboard`,
						},
					});
				} catch (error) {
					console.error("Error signing in with Google:", error);
				}
			}}
			className="flex"
		>
			Sign In with Google
		</Button>
	);

	const UserMenu = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<User className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuItem asChild>
					<Link to={ACCOUNT}>
						<Settings className="mr-2 h-4 w-4" />
						<span>Account</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onLogoutClick}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<header className="fixed top-0 z-50 w-full shadow-sm">
			<div className="max-w-5xl mx-auto flex py-4 items-center">
				<div className="flex items-center justify-between w-full px-4">
					<Link to="/" className="flex items-center space-x-2">
						<Globe2Icon className="size-6" />
						<span className="font-bold">{APP_NAME}</span>
					</Link>
					<div className="flex items-center space-x-2">
						{isSignedIn ? (
							<>
								<UserMenu />
								<Button
									variant="ghost"
									className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
									onClick={toggleMobileMenu}
								>
									{mobileMenuOpen ? (
										<X className="size-6" />
									) : (
										<Menu className="size-6" />
									)}
									<span className="sr-only">Toggle menu</span>
								</Button>
							</>
						) : (
							<SignInButton />
						)}
					</div>
				</div>
			</div>
			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="md:hidden">
					<div className="space-y-1 px-2 pb-3 pt-2">
						{isSignedIn && (
							<>
								<AppLink
									to={LISTS}
									className="block px-3 py-2 text-base font-medium"
									onClick={() => setMobileMenuOpen(false)}
								>
									Lists
								</AppLink>
								<AppLink
									to={INVITES}
									className="block px-3 py-2 text-base font-medium"
									onClick={() => setMobileMenuOpen(false)}
								>
									Invites
								</AppLink>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
}

export default Header;
