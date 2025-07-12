import {
	Globe,
	LogOut,
	Mail,
	Menu,
	Search,
	Settings,
	User,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AppLink from "~/components/app-link";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuth, useUser } from "~/lib/auth-provider";
import { cn } from "~/lib/utils";

const ACCOUNT = "/account";
const INVITES = "/invites";
const LISTS = "/lists";
const APP_NAME = "rocco";

function Header() {
	const { user, isSignedIn } = useAuth();
	const { user: userData } = useUser();
	const { signOut } = useAuth();
	const navMenuRef = useRef(null);
	const navigate = useNavigate();
	const location = useLocation();
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isHome = location.pathname === "/";

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

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
			onClick={() => navigate("/login")}
			className="hidden sm:flex"
		>
			Sign In
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
		<header
			className={cn(
				"fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
				scrolled && "shadow-sm",
			)}
		>
			<div className="container flex h-14 items-center">
				<div className="mr-4 hidden md:flex">
					<Link to="/" className="mr-6 flex items-center space-x-2">
						<span className="hidden font-bold sm:inline-block">{APP_NAME}</span>
					</Link>
					<nav className="flex items-center space-x-6 text-sm font-medium">
						{isSignedIn && (
							<>
								<AppLink to={LISTS}>Lists</AppLink>
								<AppLink to={INVITES}>Invites</AppLink>
							</>
						)}
					</nav>
				</div>
				<Button
					variant="ghost"
					className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
					onClick={toggleMobileMenu}
				>
					{mobileMenuOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
					<span className="sr-only">Toggle menu</span>
				</Button>
				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">
						{/* Search functionality can be added here */}
					</div>
					<nav className="flex items-center">
						{isSignedIn ? <UserMenu /> : <SignInButton />}
					</nav>
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
