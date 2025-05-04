import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "app/lib/api";
import { baseURL } from "app/lib/api/base";
import { MOCK_PLACE } from "app/test/mocks/place";
import { TEST_LIST_ID, testServer } from "app/test/test.setup";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";
import List from "~/routes/lists/list/index";

// Create a new QueryClient for testing
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			cacheTime: 0,
		},
	},
});

// Wrapper component for providing test context
const TestWrapper = ({ children }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Mock the necessary dependencies
vi.mock("@clerk/react-router", () => ({
	useAuth: () => ({ userId: "user-id" }),
}));

vi.mock("react-router", () => ({
	useNavigate: vi.fn(() => vi.fn()),
	useParams: vi.fn(() => ({ id: TEST_LIST_ID })),
	generatePath: vi.fn((path) => path),
	Link: ({ to, children, className }) => (
		<a href={to} className={className} data-testid="link">
			{children}
		</a>
	),
	href: vi.fn((path) => path),
	redirect: vi.fn((path) => ({ redirect: path })),
}));

vi.mock("~/hooks/useGeolocation", () => ({
	useGeolocation: () => ({ currentLocation: { lat: 0, lng: 0 } }),
}));

// Mock child components that use React Query to simplify tests
vi.mock("~/components/PlaceItem", () => ({
	default: ({ place }) => <div data-testid="place-item">{place.name}</div>,
}));

vi.mock("~/components/PlacesAutocomplete", () => ({
	default: () => (
		<div data-testid="places-autocomplete">Places Autocomplete</div>
	),
}));

vi.mock("~/components/Lists/list-menu", () => ({
	default: () => <div data-testid="list-menu">List Menu</div>,
}));

describe("List", () => {
	beforeEach(() => {
		vi.spyOn(api, "delete").mockImplementation(() => Promise.resolve());
		// Reset mocks between tests
		vi.clearAllMocks();
		queryClient.clear();
	});

	describe("when list does not belong to user", () => {
		const list = {
			id: TEST_LIST_ID,
			name: "test list",
			items: [MOCK_PLACE],
			userId: "other-user-id",
			description: "Test list description",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		beforeEach(() => {
			testServer.use(
				http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json(list);
				}),
			);
		});

		test("should display list content", async () => {
			render(
				<TestWrapper>
					<List
						loaderData={{ list }}
						matches={[]}
						params={{ id: TEST_LIST_ID }}
					/>
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});
		});
	});

	describe("own list", () => {
		const list = {
			id: TEST_LIST_ID,
			name: "test list",
			items: [MOCK_PLACE],
			userId: "user-id",
			description: "Test list description",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		beforeEach(() => {
			testServer.use(
				http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json(list);
				}),
			);
		});

		test("should hide add-to-list by default", async () => {
			render(
				<TestWrapper>
					<List
						loaderData={{ list }}
						matches={[]}
						params={{ id: TEST_LIST_ID }}
					/>
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.queryByTestId("add-to-list")).not.toBeInTheDocument();
		});

		test("should show add-to-list when add-to-list-button is clicked", async () => {
			const user = userEvent.setup();

			render(
				<TestWrapper>
					<List
						loaderData={{ list }}
						matches={[]}
						params={{ id: TEST_LIST_ID }}
					/>
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.queryByTestId("add-to-list-form")).not.toBeInTheDocument();
			expect(screen.getByTestId("add-to-list-button")).toBeInTheDocument();

			await user.click(screen.getByTestId("add-to-list-button"));

			expect(screen.getByTestId("add-to-list")).toBeInTheDocument();
		});

		test("should display add-to-list when data is empty", async () => {
			const emptyList = {
				id: TEST_LIST_ID,
				name: "test list",
				items: [],
				userId: "user-id",
				description: "Test list description",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			render(
				<TestWrapper>
					<List
						loaderData={{ list: emptyList }}
						matches={[]}
						params={{ id: TEST_LIST_ID }}
					/>
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.getByTestId("add-to-list")).toBeInTheDocument();
		});
	});
});
