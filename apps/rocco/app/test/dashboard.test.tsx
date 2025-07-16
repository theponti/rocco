import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Dashboard, { ErrorBoundary, loader } from "~/routes/dashboard";
import { MOCK_LISTS } from "~/test/mocks/index";
import {
	mockTrpcClient,
	renderWithProviders,
	renderWithRouter,
} from "~/test/utils";

// Import the hook to be mocked
import { useGeolocation } from "~/hooks/useGeolocation";

// Only mock components that are heavy or rely on external services
vi.mock("~/components/map.lazy", () => ({
	default: ({ center, zoom }: { center: any; zoom: number }) => (
		<div data-testid="rocco-map">
			Map Component (Zoom: {zoom}, Lat: {center.latitude}, Lng:{" "}
			{center.longitude})
		</div>
	),
}));

vi.mock("~/components/places/places-autocomplete", () => ({
	default: ({ center }: { center: any; setSelected: (place: any) => void }) => (
		<div data-testid="places-autocomplete">
			Places Autocomplete (Lat: {center?.latitude || "N/A"}, Lng:{" "}
			{center?.longitude || "N/A"})
		</div>
	),
}));

// Mock the useGeolocation hook
vi.mock("~/hooks/useGeolocation", () => ({
	useGeolocation: vi.fn(),
}));

// Flexible mock for useLoaderData and other react-router hooks
let mockLoaderData: any = { lists: [] };
const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useLoaderData: () => mockLoaderData,
		useMatches: () => [{ pathname: "/" }],
		Outlet: () => <div>Outlet</div>,
		href: (path: string, params?: Record<string, string | number>) => {
			let replacedPath = path;
			if (params) {
				for (const key in params) {
					replacedPath = replacedPath.replace(`:${key}`, String(params[key]));
				}
			}
			return replacedPath;
		},
		useNavigate: () => mockNavigate,
		Link: ({ to, children, className }: any) => (
			<a href={to} className={className}>
				{children}
			</a>
		),
	};
});

vi.mock("~/components/app-link", () => ({
	default: ({ to, children, className }: any) => (
		<a href={to} className={className} data-testid="app-link">
			{children}
		</a>
	),
}));

describe("Dashboard Component Tests", () => {
	beforeEach(() => {
		// Reset to default mock data before each test
		mockLoaderData = { lists: [] };
		vi.clearAllMocks(); // Clear all mocks

		// Reset geolocation mock to default successful state
		vi.mocked(useGeolocation).mockReturnValue({
			currentLocation: { latitude: 37.7749, longitude: -122.4194 },
			isLoading: false,
			error: null, // Added error property
		});

		// Reset tRPC mock to default successful state
		vi.mocked(mockTrpcClient.lists.getAll.useQuery).mockReturnValue({
			data: MOCK_LISTS,
			isLoading: false,
			error: null,
		} as any);
	});

	test("renders dashboard with all components and lists", async () => {
		renderWithProviders(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByTestId("rocco-map")).toBeInTheDocument();
			expect(screen.getByTestId("places-autocomplete")).toBeInTheDocument();
			expect(screen.getByText(MOCK_LISTS[0].name)).toBeInTheDocument();
			expect(screen.getByText(MOCK_LISTS[1].name)).toBeInTheDocument();
		});
	});

	test("shows empty state when no lists", async () => {
		vi.mocked(mockTrpcClient.lists.getAll.useQuery).mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
		} as any);

		renderWithProviders(<Dashboard />);
		await waitFor(() => {
			expect(
				screen.getByText(
					"Create your first list to start organizing places you love or want to visit.",
				),
			).toBeInTheDocument();
		});
	});

	test("renders dashboard with loading message when location not available", async () => {
		vi.mocked(useGeolocation).mockReturnValue({
			currentLocation: null, // Changed undefined to null
			isLoading: true,
			error: null, // Added error property
		});
		renderWithProviders(<Dashboard />);
		await waitFor(() => {
			expect(
				screen.getByText("Loading location for search..."),
			).toBeInTheDocument();
			expect(screen.getByTestId("rocco-map")).toBeInTheDocument();
			expect(screen.getByText(MOCK_LISTS[0].name)).toBeInTheDocument();
			expect(screen.getByText(MOCK_LISTS[1].name)).toBeInTheDocument();
		});
	});

	test("shows loading state when lists are loading", async () => {
		vi.mocked(mockTrpcClient.lists.getAll.useQuery).mockReturnValue({
			data: undefined,
			isLoading: true,
			error: null,
		} as any);

		renderWithProviders(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByTestId("rocco-map")).toBeInTheDocument();
			expect(screen.getByTestId("places-autocomplete")).toBeInTheDocument();
			// Should show loading spinner for lists
			expect(screen.getByRole("status")).toBeInTheDocument();
		});
	});

	test("shows error state when lists fail to load", async () => {
		vi.mocked(mockTrpcClient.lists.getAll.useQuery).mockReturnValue({
			data: undefined,
			isLoading: false,
			error: { message: "Failed to load lists" },
		} as any);

		renderWithProviders(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByTestId("rocco-map")).toBeInTheDocument();
			expect(screen.getByTestId("places-autocomplete")).toBeInTheDocument();
			expect(
				screen.getByText("Error loading lists: Failed to load lists"),
			).toBeInTheDocument();
		});
	});
});

describe("Dashboard Route Loader and ErrorBoundary Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks(); // Clear all mocks

		// Reset geolocation mock
		vi.mocked(useGeolocation).mockReturnValue({
			currentLocation: { latitude: 37.7749, longitude: -122.4194 },
			isLoading: false,
			error: null, // Added error property
		});

		// Reset tRPC mock
		vi.mocked(mockTrpcClient.lists.getAll.useQuery).mockReturnValue({
			data: MOCK_LISTS,
			isLoading: false,
			error: null,
		} as any);
	});

	test("shows error alert when loader throws", async () => {
		// Mock the loader to throw an error
		const mockLoader = vi.fn().mockRejectedValue(new Error("Loader error"));

		renderWithRouter({
			routes: [
				{
					path: "/dashboard",
					Component: Dashboard,
					loader: mockLoader as any,
					ErrorBoundary: ErrorBoundary as React.ComponentType<any>,
				},
			],
			isAuth: true,
			initialEntries: ["/dashboard"],
		});

		await waitFor(() => {
			expect(
				screen.getByText("Something went wrong while loading the dashboard."),
			).toBeInTheDocument();
		});
	});
});
