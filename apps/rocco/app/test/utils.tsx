import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { Outlet, createRoutesStub } from "react-router";
import { vi } from "vitest";
import { baseURL } from "~/lib/api/base";
import { rootReducer } from "~/lib/store";
import { TEST_USER_EMAIL, TEST_USER_NAME, USER_ID, getMockUser } from "./mocks";
import { testServer } from "./test.setup";

// ============================================================================
// MOCKS
// ============================================================================

// Mock Supabase auth for testing
const mockSupabaseUser = {
	id: USER_ID,
	email: TEST_USER_EMAIL,
	user_metadata: {
		name: TEST_USER_NAME,
		full_name: TEST_USER_NAME,
		first_name: "Test",
		last_name: "User",
		avatar_url: "https://example.com/avatar.jpg",
	},
	app_metadata: {},
	aud: "authenticated",
	created_at: "2023-01-01T00:00:00Z",
	updated_at: "2023-01-01T00:00:00Z",
};

const mockSession = {
	access_token: "mock-access-token",
	refresh_token: "mock-refresh-token",
	expires_in: 3600,
	expires_at: Date.now() + 3600000,
	token_type: "bearer",
	user: mockSupabaseUser,
};

// Mock Supabase client
vi.mock("~/lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
			getUser: vi.fn().mockResolvedValue({ data: { user: mockSupabaseUser } }),
			signInWithPassword: vi.fn(),
			signUp: vi.fn(),
			signOut: vi.fn(),
			signInWithOAuth: vi.fn(),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } },
			}),
		},
	},
}));

// Mock auth provider hooks
vi.mock("~/lib/auth-provider", () => ({
	useAuth: () => ({
		user: mockSupabaseUser,
		session: mockSession,
		isLoading: false,
		isSignedIn: true,
		signInWithPassword: vi.fn(),
		signUp: vi.fn(),
		signOut: vi.fn(),
		signInWithOAuth: vi.fn(),
	}),
	useUser: () => ({
		user: {
			id: USER_ID,
			email: TEST_USER_EMAIL,
			fullName: TEST_USER_NAME,
			firstName: "Test",
			lastName: "User",
			primaryEmailAddress: { emailAddress: TEST_USER_EMAIL },
			imageUrl: "https://example.com/avatar.jpg",
		},
		isLoaded: true,
	}),
	useClerk: () => ({
		signOut: vi.fn(),
	}),
}));

// ============================================================================
// TEST UTILITIES
// ============================================================================

export function createTestStore(preloadedState = {}) {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
	});
}

export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

// ============================================================================
// MSW HANDLERS
// ============================================================================

export const handlers = [
	// Mock API endpoints
	http.get(`${baseURL}/lists`, () => {
		return HttpResponse.json({
			lists: [
				{
					id: "1",
					name: "Test List",
					description: "A test list",
					userId: USER_ID,
					createdAt: "2023-01-01T00:00:00Z",
					updatedAt: "2023-01-01T00:00:00Z",
					isPublic: false,
				},
			],
		});
	}),

	http.get(`${baseURL}/user`, () => {
		return HttpResponse.json(getMockUser());
	}),

	http.post(`${baseURL}/lists`, () => {
		return HttpResponse.json({
			id: "2",
			name: "New List",
			description: "A new list",
			userId: USER_ID,
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-01-01T00:00:00Z",
			isPublic: false,
		});
	}),
];

// ============================================================================
// RENDER UTILITIES
// ============================================================================

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
				{ui}
			</QueryClientProvider>
		</Provider>,
		options,
	);
}

export function renderWithRouter(
	ui: ReactElement,
	{
		route = "/",
		preloadedState = {},
		queryClient = createTestQueryClient(),
	}: {
		route?: string;
		preloadedState?: any;
		queryClient?: QueryClient;
	} = {},
) {
	// Create store with the provided state
	const store = createTestStore(preloadedState);

	return render(
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				{ui}
			</QueryClientProvider>
		</Provider>,
	);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function waitForLoadingToFinish() {
	return screen.findByTestId("app-main");
}

export function getByTestId(testId: string) {
	return screen.getByTestId(testId);
}

export function queryByTestId(testId: string) {
	return screen.queryByTestId(testId);
}

export function findByTestId(testId: string) {
	return screen.findByTestId(testId);
}

// Mock ResizeObserver for test environment
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
(global as any).ResizeObserver = ResizeObserver;
