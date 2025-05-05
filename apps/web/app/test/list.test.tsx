import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import api, { type GetListResponse } from "app/lib/api";
import { baseURL } from "app/lib/api/base";
import List from "app/routes/lists/list/index";
import { getMockUser } from "app/test/mocks/index";
import { MOCK_LIST_PLACE } from "app/test/mocks/place";
import { TEST_LIST_ID, testServer } from "app/test/test.setup";
import { renderWithRouter } from "app/test/utils";

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

	test("should display list content", async () => {
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

	test("should hide add-to-list by default for own list", async () => {
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

		expect(screen.queryByTestId("add-to-list")).not.toBeInTheDocument();
	});

	test("should show add-to-list when add-to-list-button is clicked", async () => {
		const user = userEvent.setup();
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

	describe("List Menu and Edit Sheet", () => {
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
				http.put(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json({
						...list,
						name: "updated list name",
						description: "updated description",
					});
				}),
			);
		});

		test("should display list menu for own list", async () => {
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

			expect(
				screen.getByTestId("list-dropdownmenu-trigger"),
			).toBeInTheDocument();
		});

		test("should not display list menu for other user's list", async () => {
			const otherUserList = {
				...list,
				userId: "other-user-id",
			};

			renderWithRouter({
				isAuth: true,
				routes: [
					{
						path: `/lists/${TEST_LIST_ID}`,
						Component: List,
						loader: () => ({ list: otherUserList }),
					},
				],
				initialEntries: [`/lists/${TEST_LIST_ID}`],
			});

			await waitFor(() => {
				expect(screen.getByText("test list")).toBeInTheDocument();
			});

			expect(
				screen.queryByTestId("list-dropdownmenu-trigger"),
			).not.toBeInTheDocument();
		});

		test("should open edit sheet when clicking 'Edit' in menu", async () => {
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

			// Click on menu trigger
			await user.click(screen.getByTestId("list-dropdownmenu-trigger"));

			// Click on Edit menu item
			await user.click(screen.getByText("Edit"));

			// Check if edit sheet is displayed
			expect(screen.getByTestId("list-edit-form")).toBeInTheDocument();
			expect(screen.getByText("Edit list")).toBeInTheDocument();
		});

		test("should update list when edit form is submitted", async () => {
			const user = userEvent.setup();
			vi.spyOn(api, "put").mockResolvedValue({
				...list,
				name: "updated list name",
				description: "updated description",
			});

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

			// Click on menu trigger
			await user.click(screen.getByTestId("list-dropdownmenu-trigger"));

			// Click on Edit menu item
			await user.click(screen.getByText("Edit"));

			// Update form fields
			const nameInput = screen.getByLabelText("Name");
			await user.clear(nameInput);
			await user.type(nameInput, "updated list name");

			const descriptionInput = screen.getByLabelText("Description");
			await user.clear(descriptionInput);
			await user.type(descriptionInput, "updated description");

			// Submit form
			await user.click(screen.getByText("Save"));

			// Verify API was called with correct data
			expect(api.put).toHaveBeenCalledWith(`${baseURL}/lists/${TEST_LIST_ID}`, {
				name: "updated list name",
				description: "updated description",
			});
		});

		test("should display error message when update fails", async () => {
			const user = userEvent.setup();
			testServer.use(
				http.put(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json(
						{
							error: "Failed to update list",
						},
						{ status: 500 },
					);
				}),
			);

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

			// Click on menu trigger
			await user.click(screen.getByTestId("list-dropdownmenu-trigger"));

			// Click on Edit menu item
			await user.click(screen.getByText("Edit"));

			// Submit form without changes
			await user.click(screen.getByText("Save"));

			// Verify error alert is displayed
			await waitFor(() => {
				expect(
					screen.getByText(
						"There was an issue editing your list. Try again later.",
					),
				).toBeInTheDocument();
			});
		});

		test.skip("should close edit sheet after successful submission", async () => {
			const user = userEvent.setup();
			testServer.use(
				http.put(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json({
						...list,
						name: "updated list name",
						description: "updated description",
					});
				}),
			);

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

			// Click on menu trigger
			await user.click(screen.getByTestId("list-dropdownmenu-trigger"));

			// Click on Edit menu item
			await user.click(screen.getByText("Edit"));

			// Verify edit sheet is open
			expect(screen.getByTestId("list-edit-form")).toBeInTheDocument();

			// Submit form
			await user.click(screen.getByText("Save"));

			// Verify sheet is closed
			await waitFor(() => {
				expect(screen.queryByTestId("list-edit-form")).not.toBeInTheDocument();
			});
		});

		test("should pre-fill form with list data", async () => {
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

			// Click on menu trigger
			await user.click(screen.getByTestId("list-dropdownmenu-trigger"));

			// Click on Edit menu item
			await user.click(screen.getByText("Edit"));

			// Verify form fields have correct values
			const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
			expect(nameInput.value).toBe("test list");

			const descriptionInput = screen.getByLabelText(
				"Description",
			) as HTMLTextAreaElement;
			expect(descriptionInput.value).toBe("Test list description");
		});
	});
});
