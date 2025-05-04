import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api, { type GetListResponse } from "app/lib/api";
import { baseURL } from "app/lib/api/base";
import { MOCK_LIST_PLACE } from "app/test/mocks/place";
import { TEST_LIST_ID, testServer } from "app/test/test.setup";
import { renderWithRouter } from "app/test/utils";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getMockUser } from "app/test/utils";
import List from "~/routes/lists/list/index";

vi.mock("~/hooks/useGeolocation", () => ({
	useGeolocation: () => ({ currentLocation: { lat: 0, lng: 0 } }),
}));

describe("List", () => {
	beforeEach(() => {
		vi.spyOn(api, "delete").mockImplementation(() => Promise.resolve());
		vi.clearAllMocks();
	});

	describe("when list does not belong to user", () => {
		const list: GetListResponse = {
			id: TEST_LIST_ID,
			name: "test list",
			items: [MOCK_LIST_PLACE],
			userId: "other-user-id",
			description: "Test list description",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			listId: TEST_LIST_ID,
			createdBy: getMockUser(),
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
			renderWithRouter({
				isAuth: true,
				routes: [
					{
						path: `/lists/${TEST_LIST_ID}`,
						Component: List,
						loader: () => ({ list }),
					},
				],
				initialEntries: [`/lists/${TEST_LIST_ID}`],
			});

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});
		});
	});

	describe("own list", () => {
		const list: GetListResponse = {
			id: TEST_LIST_ID,
			name: "test list",
			items: [MOCK_LIST_PLACE],
			userId: "user-id",
			description: "Test list description",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			listId: TEST_LIST_ID,
			createdBy: getMockUser(),
		};

		beforeEach(() => {
			testServer.use(
				http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json(list);
				}),
			);
		});

		test("should hide add-to-list by default", async () => {
			renderWithRouter({
				isAuth: true,
				routes: [
					{
						Component: List,
						loader: () => ({ list }),
						path: `/lists/${TEST_LIST_ID}`,
					},
				],
				initialEntries: [`/lists/${TEST_LIST_ID}`],
			});

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.queryByTestId("add-to-list")).not.toBeInTheDocument();
		});

		test("should show add-to-list when add-to-list-button is clicked", async () => {
			const user = userEvent.setup();

			renderWithRouter({
				isAuth: true,
				routes: [
					{
						path: `/lists/${TEST_LIST_ID}`,
						Component: List,
						loader: () => ({ list }),
					},
				],
				initialEntries: [`/lists/${TEST_LIST_ID}`],
			});

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.queryByTestId("add-to-list-form")).not.toBeInTheDocument();
			expect(screen.getByTestId("add-to-list-button")).toBeInTheDocument();

			await user.click(screen.getByTestId("add-to-list-button"));

			expect(screen.getByTestId("add-to-list")).toBeInTheDocument();
		});

		test("should display add-to-list when data is empty", async () => {
			const emptyList: GetListResponse = {
				id: TEST_LIST_ID,
				name: "test list",
				items: [],
				userId: "user-id",
				description: "Test list description",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				listId: TEST_LIST_ID,
				createdBy: getMockUser(),
			};

			renderWithRouter({
				isAuth: true,
				routes: [
					{
						path: `/lists/${TEST_LIST_ID}`,
						Component: List,
						loader: () => ({ list: emptyList }),
					},
				],
				initialEntries: [`/lists/${TEST_LIST_ID}`],
			});

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(screen.getByTestId("add-to-list")).toBeInTheDocument();
		});
	});
});
