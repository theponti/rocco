import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { baseURL } from "~/lib/api/base";
import Dashboard, { ErrorBoundary, loader } from "~/routes/dashboard/index";
import { MOCK_LISTS } from "~/test/mocks/index";
import { testServer } from "~/test/test.setup";
import { renderWithProviders, renderWithRouter } from "~/test/utils";

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
			Places Autocomplete (Lat: {center.latitude}, Lng: {center.longitude})
		</div>
	),
}));

// Mock the useGeolocation hook
vi.mock("~/hooks/useGeolocation", () => ({
	useGeolocation: vi.fn(),
}));

// Flexible mock for useLoaderData and other react-router hooks
let mockLoaderData: any = { lists: MOCK_LISTS };
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
		mockLoaderData = { lists: MOCK_LISTS };
		vi.clearAllMocks(); // Clear all mocks

		// Reset geolocation mock to default successful state
		vi.mocked(useGeolocation).mockReturnValue({
			currentLocation: { latitude: 37.7749, longitude: -122.4194 },
			isLoading: false,
			error: null, // Added error property
		});
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
		mockLoaderData = { lists: [] };
		renderWithProviders(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByText("Create your first list to start organizing places you love or want to visit.")).toBeInTheDocument();
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
});

describe("Dashboard Route Loader and ErrorBoundary Tests", () => {
	beforeEach(() => {
		testServer.resetHandlers();
		vi.clearAllMocks(); // Clear all mocks

		// Reset geolocation mock
		vi.mocked(useGeolocation).mockReturnValue({
			currentLocation: { latitude: 37.7749, longitude: -122.4194 },
			isLoading: false,
			error: null, // Added error property
		});
	});

	test("shows error alert when loader throws", async () => {
		testServer.use(
			http.get(`${baseURL}/lists`, ({ request }: any) => {
				const url = new URL(request.url);
				const itemType = url.searchParams.get("itemType");
				if (itemType === "PLACE") {
					return HttpResponse.json(
						{ error: "Failed to fetch lists" },
						{ status: 500 },
					);
				}
				return HttpResponse.json(
					{ error: "Incorrect request parameters" },
					{ status: 400 },
				);
			}),
		);

		renderWithRouter({
			routes: [
				{
					path: "/dashboard",
					Component: Dashboard,
					loader: loader as any,
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
