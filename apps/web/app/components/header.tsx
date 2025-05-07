import { SignInButton, useAuth, useClerk, useUser } from "@clerk/react-router";
import styled from "@emotion/styled";
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
import Button from "./button";

const ACCOUNT = "/account";
const INVITES = "/invites";
const LISTS = "/lists";
const APP_NAME = "rocco";

const StyledHeader = styled.header<{
	isHome: boolean;
	scrolled: boolean;
}>`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	width: 100%;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	backdrop-filter: blur(12px);
	background: ${(props) => (props.isHome && !props.scrolled ? "transparent" : "rgba(30, 30, 36, 0.5)")};
	border-bottom: 1px solid ${(props) => (props.isHome && !props.scrolled ? "transparent" : "rgba(255, 255, 255, 0.06)")};
	box-shadow: ${(props) => (props.scrolled ? "0 8px 32px rgba(0, 0, 0, 0.2)" : "none")};

	@media (prefers-reduced-motion) {
		transition: none;
	}
`;

const Logo = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	gap: 0.65rem;
	
	.logo-icon {
		position: relative;
		z-index: 1;
	}
	
	.logo-text {
		position: relative;
		z-index: 1;
		font-weight: 800;
		background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.75) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-fill-color: transparent;
	}
	
	&::after {
		content: '';
		position: absolute;
		width: 24px;
		height: 24px;
		background: radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(99, 102, 241, 0) 70%);
		border-radius: 50%;
		z-index: 0;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		filter: blur(8px);
		opacity: 0.8;
	}
`;

const NavLink = styled(AppLink)`
	position: relative;
	font-weight: 500;
	padding: 0.5rem 0.875rem;
	transition: all 0.2s ease;
	border-radius: 0.375rem;
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.9375rem;
	
	&:hover {
		color: rgba(255, 255, 255, 1);
		background: rgba(255, 255, 255, 0.08);
	}
	
	&.active {
		color: white;
		background: rgba(99, 102, 241, 0.15);
		
		&::after {
			width: 15px;
			opacity: 1;
		}
	}
	
	&::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 50%;
		width: 0;
		height: 2px;
		background: linear-gradient(90deg, #6366f1, #8b5cf6);
		transition: all 0.3s ease;
		transform: translateX(-50%);
		opacity: 0;
		border-radius: 2px;
	}
	
	&:hover::after {
		width: 15px;
		opacity: 1;
	}
`;

const MobileMenu = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 99;
	display: flex;
	flex-direction: column;
	padding: 5rem 1.5rem 2rem;
	background: linear-gradient(145deg, rgba(13, 12, 34, 0.97), rgba(26, 24, 52, 0.97));
	backdrop-filter: blur(16px);
	transform-origin: top;
	overflow-y: auto;
`;

const ButtonPrimary = styled(Button)`
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	border: none;
	box-shadow: 0 4px 14px rgba(99, 102, 241, 0.39);
	font-weight: 600;
	padding: 0.625rem 1.5rem;
	transition: all 0.3s ease;
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
		background: linear-gradient(135deg, #5457ea 0%, #7c50e7 100%);
	}
	
	&:active {
		transform: translateY(0);
	}
`;

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
		<StyledHeader
			isHome={isHome}
			scrolled={scrolled}
			className={`flex items-center justify-between ${
				isHome && !scrolled
					? "py-5 md:py-6 px-5 md:px-10 lg:px-20"
					: "py-3 md:py-4 px-4 md:px-8"
			} transition-all duration-300`}
		>
			{/* Logo */}
			<Link to="/" className="flex items-center gap-2.5 z-[101] relative group">
				<Logo>
					<Globe className="logo-icon size-7 text-white group-hover:text-indigo-300 transition-colors duration-300" />
					<span className="logo-text lowercase text-xl md:text-2xl">
						{APP_NAME}
					</span>
				</Logo>
			</Link>

			{/* Desktop Navigation */}
			<nav
				className={`hidden md:flex items-center ${userId ? "space-x-1" : "space-x-8"}`}
			>
				{userId ? (
					<>
						<NavLink
							to="/dashboard"
							className={`flex items-center gap-2 ${location.pathname === "/dashboard" ? "active" : ""}`}
						>
							<Search size={16} />
							<span>Dashboard</span>
						</NavLink>
						<NavLink
							to={LISTS}
							className={`flex items-center gap-2 ${location.pathname.includes(LISTS) ? "active" : ""}`}
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
						</NavLink>
						<NavLink
							to={INVITES}
							className={`flex items-center gap-2 ${location.pathname.includes(INVITES) ? "active" : ""}`}
						>
							<Mail size={16} />
							<span>Invites</span>
						</NavLink>
					</>
				) : (
					<>
						<a
							href="#features"
							className="text-white/80 hover:text-white font-medium transition-colors"
						>
							Features
						</a>
						<a
							href="#testimonials"
							className="text-white/80 hover:text-white font-medium transition-colors"
						>
							Testimonials
						</a>
						<a
							href="#pricing"
							className="text-white/80 hover:text-white font-medium transition-colors"
						>
							Pricing
						</a>
					</>
				)}
			</nav>

			{/* Auth Section */}
			<div className="flex items-center gap-2 z-[101]">
				{userId ? (
					<>
						{/* User Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger
								ref={navMenuRef}
								data-testid="auth-dropdown-button"
								className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
							>
								{user?.imageUrl ? (
									<img
										src={user.imageUrl}
										alt="Profile"
										className="w-8 h-8 rounded-full object-cover border border-white/10"
									/>
								) : (
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold border border-white/10">
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
								className="w-64 p-2 bg-zinc-900/95 text-white rounded-xl border border-white/10 shadow-xl backdrop-blur-md"
							>
								<div className="px-3 py-3 border-b border-white/5 mb-1.5">
									<div className="font-medium">
										{user?.firstName} {user?.lastName}
									</div>
									<div className="text-xs text-gray-400 truncate mt-0.5">
										{user?.emailAddresses?.[0]?.emailAddress}
									</div>
								</div>

								<DropdownMenuItem className="rounded-lg focus:bg-white/5 my-0.5">
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

								<DropdownMenuItem className="rounded-lg focus:bg-white/5 my-0.5">
									<Link
										to={INVITES}
										className="flex w-full items-center gap-3 py-2 px-1.5"
									>
										<Mail size={18} />
										<span>Invites</span>
									</Link>
								</DropdownMenuItem>

								<DropdownMenuItem className="rounded-lg focus:bg-white/5 my-0.5">
									<Link
										to={ACCOUNT}
										className="flex w-full items-center gap-3 py-2 px-1.5"
									>
										<Settings size={18} />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>

								<div className="h-px bg-white/5 my-1.5" />

								<DropdownMenuItem className="rounded-lg focus:bg-white/5 my-0.5">
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
							className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none md:hidden border border-white/10 transition-all duration-200"
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
							<ButtonPrimary className="text-white rounded-lg">
								Get Started
							</ButtonPrimary>
						</SignInButton>

						{/* Mobile Menu Toggle */}
						<button
							type="button"
							className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none md:hidden border border-white/10 transition-all duration-200"
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
				<MobileMenu className="animate-in slide-in-from-top duration-300">
					<div
						className="flex flex-col space-y-3 mt-4"
						onClick={toggleMobileMenu}
					>
						{userId ? (
							<>
								<AppLink
									to="/dashboard"
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
									onClick={toggleMobileMenu}
									onKeyUp={toggleMobileMenu}
								>
									<Search size={20} />
									Dashboard
								</AppLink>

								<AppLink
									to={LISTS}
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
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
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
									onClick={toggleMobileMenu}
									onKeyUp={toggleMobileMenu}
								>
									<Mail size={20} />
									Invites
								</AppLink>

								<AppLink
									to={ACCOUNT}
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
									onClick={toggleMobileMenu}
									onKeyUp={toggleMobileMenu}
								>
									<Settings size={20} />
									Settings
								</AppLink>

								<button
									type="button"
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-red-400 font-medium hover:bg-white/10 hover:text-red-300 transition-all text-left mt-2"
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
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
									onClick={toggleMobileMenu}
								>
									Log in
								</Link>

								<a
									href="#features"
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
									onClick={toggleMobileMenu}
								>
									Features
								</a>

								<a
									href="#testimonials"
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
									onClick={toggleMobileMenu}
								>
									Testimonials
								</a>

								<a
									href="#pricing"
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
									onClick={toggleMobileMenu}
								>
									Pricing
								</a>

								<SignInButton>
									<ButtonPrimary className="w-full justify-center py-3 mt-2">
										Get Started
									</ButtonPrimary>
								</SignInButton>
							</>
						)}
					</div>

					<div className="mt-auto pt-8 text-center text-xs text-gray-500">
						<p>
							© {new Date().getFullYear()} {APP_NAME}. All rights reserved.
						</p>
					</div>
				</MobileMenu>
			)}
		</StyledHeader>
	);
}

export default Header;
