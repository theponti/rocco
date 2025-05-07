import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";

import ListsScene, { ErrorBoundary, loader } from "app/routes/lists/index";
import { testServer } from "app/test/test.setup";
import { renderWithRouter } from "app/test/utils";
import { MOCK_LISTS } from "./mocks";

describe("ListsScene", () => {
	test("renders lists page with lists", async () => {
		renderWithRouter({
			routes: [
				{
					path: "/lists",
					Component: ListsScene,
					loader: () => ({ lists: MOCK_LISTS }),
				},
			],
			isAuth: true,
			initialEntries: ["/lists"],
		});

		await waitFor(() => {
			expect(screen.getByText("Lists")).toBeInTheDocument();
			expect(screen.getByText(MOCK_LISTS[0].name)).toBeInTheDocument();
			expect(screen.getByText(MOCK_LISTS[1].name)).toBeInTheDocument();
		});
	});

	test("shows empty state when no lists", async () => {
		renderWithRouter({
			routes: [
				{
					path: "/lists",
					Component: ListsScene,
					loader: () => ({ lists: [] }),
				},
			],
			isAuth: true,
			initialEntries: ["/lists"],
		});

		await waitFor(() => {
			expect(screen.getByText("Create your first list")).toBeInTheDocument();
		});
	});

	test("shows error alert when loader throws", async () => {
		testServer.use(
			http.get("/lists", () => {
				return HttpResponse.json(
					{ error: "Failed to fetch lists" },
					{ status: 500 },
				);
			}),
		);

		renderWithRouter({
			routes: [
				{
					path: "/lists",
					Component: ListsScene,
					loader,
					ErrorBoundary,
				},
			],
			isAuth: true,
			initialEntries: ["/lists"],
		});

		await waitFor(() => {
			expect(
				screen.getByText("An unexpected error occurred while loading lists."),
			).toBeInTheDocument();
		});
	});
});
