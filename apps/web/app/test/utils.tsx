import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render, screen } from "@testing-library/react";
import { baseURL } from "app/lib/api/base";
import { rootReducer } from "app/lib/store";
import type { ListPlace, User } from "app/lib/types";
import { HttpResponse, http } from "msw";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { Outlet, createRoutesStub } from "react-router";
import { vi } from "vitest";
import { testServer } from "./test.setup";

// ============================================================================
// CONSTANTS & TEST DATA
// ============================================================================

export const USER_ID = "user-id";
export const TEST_USER_EMAIL = "test-user@ponti.io";
export const TEST_USER_NAME = "Test User";

export const TEST_USER: User = {
	id: USER_ID,
	avatar: "https://example.com/avatar.jpg",
	isAdmin: "false",
	name: TEST_USER_NAME,
	email: TEST_USER_EMAIL,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

export const getMockUser = (): User => ({
	id: USER_ID,
	avatar: "https://example.com/avatar.jpg",
	email: TEST_USER_EMAIL,
	createdAt: "2021-01-01T00:00:00.000Z",
	updatedAt: "2021-01-01T00:00:00.000Z",
	isAdmin: "false",
	name: TEST_USER_NAME,
});

export const getMockPlace = (): ListPlace => ({
	imageUrl: "https://example.com/image.jpg",
	googleMapsId: "123",
	name: "Place Name",
	types: ["type1", "type2"],
	id: "123",
	itemId: "123",
	description: "Description",
});

export const getMockLists = () => [
	{
		id: "1",
		name: "List 1",
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
		createdBy: getMockUser(),
		places: [getMockPlace()],
	},
	{
		id: "2",
		name: "List 2",
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
		createdBy: getMockUser(),
		places: [getMockPlace()],
	},
];

// ============================================================================
// MOCKS
// ============================================================================

// Mock Clerk provider for testing
const MockClerkProvider = ({ children }: { children: ReactNode }) => children;

// Set up Clerk auth mocks
vi.mock("@clerk/react-router", () => ({
	ClerkProvider: ({ children }: { children: ReactNode }) => children,
	useAuth: () => ({ userId: USER_ID, isLoaded: true, isSignedIn: true }),
	useUser: () => ({
		user: {
			fullName: TEST_USER_NAME,
			firstName: "Test",
			lastName: "User",
			primaryEmailAddress: { emailAddress: TEST_USER_EMAIL },
		},
		isLoaded: true,
	}),
	useClerk: () => ({
		signOut: vi.fn(),
	}),
}));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a fresh QueryClient for testing with standardized options
 */
export const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				staleTime: 0,
			},
		},
	});

/**
 * Creates a Redux store with consistent configuration for testing
 */
export const createTestStore = (preloadedState = {}) =>
	configureStore({
		reducer: rootReducer,
		preloadedState,
	});

// ============================================================================
// COMPONENT TEST UTILITIES (DIRECT COMPONENT TESTING)
// ============================================================================

/**
 * Helper component for route structure testing
 */
export const TestLayout = () => <Outlet />;

// ============================================================================
// ROUTER-BASED TEST UTILITIES
// ============================================================================

type FirstArg<T> = T extends (arg1: infer A, ...args: any[]) => any ? A : never;
/**
 * Renders a component within a full React Router v7 context
 * This is the recommended way to test components that use router features
 */
export function renderWithRouter({
	routes,
	isAuth = true,
	initialEntries,
	preloadedState = {},
	queryClient = createTestQueryClient(),
}: {
	isAuth?: boolean;
	initialEntries: string[];
	routes: FirstArg<typeof createRoutesStub>;
	preloadedState?: any;
	queryClient?: QueryClient;
}) {
	// Configure API mocks
	testServer.use(
		http.get(`${baseURL}/me`, () => {
			return isAuth
				? HttpResponse.json(getMockUser())
				: HttpResponse.text("Unauthorized", { status: 401 });
		}),
	);

	// Create router with the provided configuration
	const Stub = createRoutesStub(routes);

	// Render with all necessary providers
	const utils = renderWithProviders(<Stub initialEntries={initialEntries} />, {
		preloadedState,
	});

	return {
		component: utils,
		queryClient,
		screen,
	};
}

export function renderWithProviders(
	ui: ReactElement,
	{
		preloadedState = {},
		queryClient = createTestQueryClient(),
	}: {
		preloadedState?: any;
		queryClient?: QueryClient;
	} = {},
	options: RenderOptions = {},
) {
	// Create store with the provided state
	const store = createTestStore(preloadedState);

	return render(
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<MockClerkProvider>{ui}</MockClerkProvider>
			</QueryClientProvider>
		</Provider>,
		options,
	);
}
