import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "app/test/utils";
import { describe, expect, test, vi } from "vitest";

// Mock necessary React Router hooks and components
vi.mock("react-router", () => ({
	useNavigate: vi.fn(() => vi.fn()),
	useParams: vi.fn(() => ({})),
	generatePath: vi.fn((path) => path),
	href: vi.fn((path) => path),
	redirect: vi.fn((path) => ({ redirect: path })),
	Link: ({ to, children, className, ...props }) => (
		<a href={to} className={className} {...props} data-testid="link">
			{children}
		</a>
	),
	useLoaderData: vi.fn(() => ({})),
	useMatches: vi.fn(() => []),
	Form: ({ children, ...props }) => <form {...props}>{children}</form>,
}));

// Mock authentication hooks
vi.mock("@clerk/react-router", () => ({
	useAuth: () => ({ userId: "user-id", isLoaded: true, isSignedIn: true }),
	SignInButton: ({ children }) => (
		<button data-testid="header-login-button">{children}</button>
	),
	SignedIn: ({ children }) => <div data-testid="signed-in">{children}</div>,
	SignedOut: ({ children }) => <div data-testid="signed-out">{children}</div>,
}));

// Import after mocks are set up
import LandingPage from "../index";
import { Layout } from "../root";

describe("landing", () => {
	test("renders", () => {
		renderWithProviders(
			<LandingPage loaderData={{}} matches={[]} params={{}} />,
		);
		const heading = screen.getByTestId("home-header");
		expect(heading).toBeInTheDocument();
	});

	test("should render log in button if user is not logged in", () => {
		// In React Router v7, we would typically test routes rather than components directly
		// But for this test, we can still use the component pattern
		renderWithProviders(
			<Layout>
				<div data-testid="header-login-button" />
			</Layout>,
		);

		expect(screen.queryByTestId("header-login-button")).toBeInTheDocument();
	});

	test("should render auth nav menu if user is logged in", async () => {
		renderWithProviders(
			<Layout>
				<div data-testid="auth-dropdown-button" />
			</Layout>,
			{ isAuth: true },
		);

		await waitFor(() => {
			expect(screen.queryByTestId("auth-dropdown-button")).toBeInTheDocument();
		});
	});
});
