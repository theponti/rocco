import { SignInButton, useAuth, useClerk, useUser } from "@clerk/react-router";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import Button from "./button";

const ACCOUNT = "/account";
const INVITES = "/invites";
const LISTS = "/lists";
const APP_NAME = "rocco";

function Header() {
	const { userId } = useAuth();
	const { user } = useUser();
	const { signOut } = useClerk();
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

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 w-full",
				"transition-all duration-200 ease-in-out",
				"flex items-center justify-between border-b border-gray-800",
				{
					"py-5 md:py-6 px-5 md:px-10 lg:px-20 bg-transparent":
						isHome && !scrolled,
					"py-3 md:py-4 px-4 md:px-8 bg-gray-900/80 backdrop-blur-sm":
						!isHome || scrolled,
				},
			)}
		>
			{/* Logo */}
			<Link to="/" className="flex items-center gap-2 text-white">
				<div className="flex items-center gap-2">
					<Globe className="size-5 mt-1" />
					<span className="font-bold text-xl md:text-2xl lowercase">
						{APP_NAME}
					</span>
				</div>
			</Link>

			{/* Desktop Navigation */}
			<nav
				className={cn("hidden md:flex items-center", {
					"space-x-2": userId,
					"space-x-6": !userId,
				})}
			>
				{userId ? (
					<>
						<AppLink
							to="/dashboard"
							className={cn(
								"font-medium py-2 px-3 rounded-md text-white/90 hover:text-white hover:bg-white/10",
								"flex items-center gap-2",
								{
									"bg-white/10 text-white": location.pathname === "/dashboard",
								},
							)}
						>
							<Search size={16} />
							<span>Dashboard</span>
						</AppLink>
						<AppLink
							to={LISTS}
							className={cn(
								"font-medium py-2 px-3 rounded-md text-white/90 hover:text-white hover:bg-white/10",
								"flex items-center gap-2",
								{ "bg-white/10 text-white": location.pathname.includes(LISTS) },
							)}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="stroke-current"
							>
								<title>Lists icon</title>
								<path
									d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span>Lists</span>
						</AppLink>
						<AppLink
							to={INVITES}
							className={cn(
								"font-medium py-2 px-3 rounded-md text-white/90 hover:text-white hover:bg-white/10",
								"flex items-center gap-2",
								{
									"bg-white/10 text-white": location.pathname.includes(INVITES),
								},
							)}
						>
							<Mail size={16} />
							<span>Invites</span>
						</AppLink>
					</>
				) : (
					<>
						<a
							href="#features"
							className="text-white/80 hover:text-white font-medium"
						>
							Features
						</a>
						<a
							href="#testimonials"
							className="text-white/80 hover:text-white font-medium"
						>
							Testimonials
						</a>
						<a
							href="#pricing"
							className="text-white/80 hover:text-white font-medium"
						>
							Pricing
						</a>
					</>
				)}
			</nav>

			{/* Auth Section */}
			<div className="flex items-center gap-2">
				{userId ? (
					<>
						{/* User Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger
								ref={navMenuRef}
								data-testid="auth-dropdown-button"
								className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 text-white"
							>
								{user?.imageUrl ? (
									<img
										src={user.imageUrl}
										alt="Profile"
										className="w-8 h-8 rounded-full object-cover border border-white/10"
									/>
								) : (
									<div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold border border-white/10">
										{user?.firstName?.[0] || user?.lastName?.[0] || (
											<User size={18} className="text-white/90" />
										)}
									</div>
								)}
								<span className="hidden sm:inline text-sm font-medium text-white/90">
									{user?.firstName || "Account"}
								</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								data-testid="dropdown-content"
								className="w-64 p-2 bg-zinc-800 text-white rounded-lg border border-white/10 shadow-lg"
							>
								<div className="px-3 py-3 border-b border-white/10 mb-1.5">
									<div className="font-medium">
										{user?.firstName} {user?.lastName}
									</div>
									<div className="text-xs text-gray-400 truncate mt-0.5">
										{user?.emailAddresses?.[0]?.emailAddress}
									</div>
								</div>

								<DropdownMenuItem className="rounded-lg focus:bg-white/10 my-0.5 text-white">
									<Link
										to={LISTS}
										className="flex w-full items-center gap-3 py-2 px-1.5"
									>
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className="stroke-current"
										>
											<title>Lists icon</title>
											<path
												d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										<span>Lists</span>
									</Link>
								</DropdownMenuItem>

								<DropdownMenuItem className="rounded-lg focus:bg-white/10 my-0.5 text-white">
									<Link
										to={INVITES}
										className="flex w-full items-center gap-3 py-2 px-1.5"
									>
										<Mail size={18} />
										<span>Invites</span>
									</Link>
								</DropdownMenuItem>

								<DropdownMenuItem className="rounded-lg focus:bg-white/10 my-0.5 text-white">
									<Link
										to={ACCOUNT}
										className="flex w-full items-center gap-3 py-2 px-1.5"
									>
										<Settings size={18} />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>

								<div className="h-px bg-white/10 my-1.5" />

								<DropdownMenuItem className="rounded-lg focus:bg-white/10 my-0.5">
									<button
										type="button"
										className="flex w-full items-center gap-3 py-2 px-1.5 text-red-400 hover:text-red-300"
										onClick={onLogoutClick}
									>
										<LogOut size={18} />
										<span>Logout</span>
									</button>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Mobile Menu Toggle */}
						<button
							type="button"
							className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none md:hidden border border-white/10 transition-all duration-200 text-white"
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
							onClick={toggleMobileMenu}
						>
							{mobileMenuOpen ? (
								<X size={20} className="text-white" />
							) : (
								<Menu size={20} className="text-white" />
							)}
						</button>
					</>
				) : (
					<>
						<Link
							to="/login"
							className="text-white/80 hover:text-white font-medium hidden md:block mr-3 transition-colors"
						>
							Log in
						</Link>
						<SignInButton>
							<Button className="text-white rounded-md bg-indigo-600 hover:bg-indigo-700 font-semibold py-2 px-4 transition-colors duration-200">
								Get Started
							</Button>
						</SignInButton>

						{/* Mobile Menu Toggle */}
						<button
							type="button"
							className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none md:hidden border border-white/10 transition-all duration-200 text-white"
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
							onClick={toggleMobileMenu}
						>
							{mobileMenuOpen ? (
								<X size={20} className="text-white" />
							) : (
								<Menu size={20} className="text-white" />
							)}
						</button>
					</>
				)}
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-[99] flex flex-col pt-20 px-6 pb-8 bg-neutral-900/95 backdrop-blur-sm origin-top overflow-y-auto animate-in slide-in-from-top duration-200 text-white">
					<div className="flex flex-col space-y-2 mt-4">
						{userId ? (
							<>
								<AppLink
									to="/dashboard"
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
									onKeyUp={toggleMobileMenu}
								>
									<Search size={20} />
									Dashboard
								</AppLink>

								<AppLink
									to={LISTS}
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
									onKeyUp={toggleMobileMenu}
								>
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="stroke-current"
									>
										<title>Lists icon</title>
										<path
											d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									Lists
								</AppLink>

								<AppLink
									to={INVITES}
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
									onKeyUp={toggleMobileMenu}
								>
									<Mail size={20} />
									Invites
								</AppLink>

								<AppLink
									to={ACCOUNT}
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
									onKeyUp={toggleMobileMenu}
								>
									<Settings size={20} />
									Settings
								</AppLink>

								<button
									type="button"
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-red-500 font-medium hover:bg-white/10 hover:text-red-400 transition-colors text-left mt-2"
									onClick={() => {
										onLogoutClick();
										toggleMobileMenu();
									}}
								>
									<LogOut size={20} />
									Logout
								</button>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
								>
									Log in
								</Link>

								<Link
									to="#features"
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
								>
									Features
								</Link>

								<Link
									to="#testimonials"
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
								>
									Testimonials
								</Link>

								<Link
									to="#pricing"
									className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
									onClick={toggleMobileMenu}
								>
									Pricing
								</Link>

								<SignInButton>
									<Button className="w-full justify-center py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200">
										Get Started
									</Button>
								</SignInButton>
							</>
						)}
					</div>

					<div className="mt-auto pt-8 text-center text-xs text-gray-400">
						<p>
							© {new Date().getFullYear()} {APP_NAME}. All rights reserved.
						</p>
					</div>
				</div>
			)}
		</header>
	);
}

export default Header;
