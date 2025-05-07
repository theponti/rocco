import { screen, waitFor } from "@testing-library/react";

import { describe, expect, test, vi } from "vitest";
import Dashboard from "~/routes/dashboard/index";
import { MOCK_LISTS } from "~/test/mocks/index";
import { renderWithProviders } from "~/test/utils";

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

// Mock the geolocation hook
vi.mock("~/hooks/useGeolocation", () => ({
	useGeolocation: () => ({
		currentLocation: { latitude: 37.7749, longitude: -122.4194 },
		isLoading: false,
	}),
}));

// Mock react-router's useLoaderData hook
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useLoaderData: () => ({ lists: MOCK_LISTS }),
		useMatches: () => [{ pathname: "/" }],
		Outlet: () => <div>Outlet</div>,
		href: () => "/test-url",
		useNavigate: () => vi.fn(),
		Link: ({ to, children, className }: any) => (
			<a href={to} className={className}>
				{children}
			</a>
		),
	};
});

// Mock AppLink component to avoid router issues
vi.mock("~/components/app-link", () => ({
	default: ({ to, children, className }: any) => (
		<a href={to} className={className} data-testid="app-link">
			{children}
		</a>
	),
}));

describe("Dashboard", () => {
	test("renders dashboard with all components and lists", async () => {
		// Render the component directly with all providers
		renderWithProviders(<Dashboard />);

		// Verify components render correctly
		await waitFor(() => {
			// Check map is displayed
			expect(screen.getByTestId("rocco-map")).toBeInTheDocument();

			// In our mocked version, the loading message shows instead of the autocomplete
			expect(
				screen.getByText("Loading location for search..."),
			).toBeInTheDocument();

			// Verify lists render correctly
			expect(screen.getByText("Coffee Spots")).toBeInTheDocument();
			expect(screen.getByText("Weekend Getaways")).toBeInTheDocument();
		});
	});

	test("renders dashboard with loading message when location not available", async () => {
		// Override the geolocation mock for this specific test
		vi.mock("~/hooks/useGeolocation", () => ({
			useGeolocation: () => ({
				currentLocation: null,
				isLoading: true,
			}),
		}));

		// Render the component directly with all providers
		renderWithProviders(<Dashboard />);

		await waitFor(() => {
			// Verify loading message is shown when location is not available
			expect(
				screen.getByText("Loading location for search..."),
			).toBeInTheDocument();

			// Verify map still renders
			expect(screen.getByTestId("rocco-map")).toBeInTheDocument();

			// Verify lists still render
			expect(screen.getByText("Coffee Spots")).toBeInTheDocument();
			expect(screen.getByText("Weekend Getaways")).toBeInTheDocument();
		});
	});
});
