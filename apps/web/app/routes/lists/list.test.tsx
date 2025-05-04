import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "app/lib/api";
import { baseURL } from "app/lib/api/base";
import { MOCK_PLACE } from "app/test/mocks/place";
import { TEST_LIST_ID, testServer } from "app/test/test.setup";
import { renderWithProviders } from "app/test/utils";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("~/hooks/useGeolocation", () => ({
	useGeolocation: () => ({ currentLocation: { lat: 0, lng: 0 } }),
}));

// Import the component after all mocks are set up
import List from "~/routes/lists/list/index";

describe("List", () => {
	beforeEach(() => {
		vi.spyOn(api, "delete").mockImplementation(() => Promise.resolve());
		vi.clearAllMocks();
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
				http.get(`${baseURL}/me`, () => {
					return HttpResponse.json({
						email: "test@test.com",
						id: "test-id",
					});
				}),
				http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json(list);
				}),
			);
		});

		test("should display list content", async () => {
			renderWithProviders(
				<List
					loaderData={{ list }}
					matches={[]}
					params={{ id: TEST_LIST_ID }}
				/>,
				{ isAuth: true },
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
			renderWithProviders(
				<List
					loaderData={{ list }}
					matches={[]}
					params={{ id: TEST_LIST_ID }}
				/>,
				{ isAuth: true },
			);

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.queryByTestId("add-to-list")).not.toBeInTheDocument();
		});

		test("should show add-to-list when add-to-list-button is clicked", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<List
					loaderData={{ list }}
					matches={[]}
					params={{ id: TEST_LIST_ID }}
				/>,
				{ isAuth: true },
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

			renderWithProviders(
				<List
					loaderData={{ list: emptyList }}
					matches={[]}
					params={{ id: TEST_LIST_ID }}
				/>,
				{ isAuth: true },
			);

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.getByTestId("add-to-list")).toBeInTheDocument();
		});
	});
});
