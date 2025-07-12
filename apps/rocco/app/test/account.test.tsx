import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";

import { baseURL } from "~/lib/api/base";
import Account from "~/routes/account/index";
import { getMockUser } from "~/test/mocks/index";
import { testServer } from "~/test/test.setup";
import { renderWithRouter } from "~/test/utils";

const MOCK_USER = getMockUser();

describe("Account", () => {
	test("renders account page with user information", async () => {
		renderWithRouter({
			routes: [
				{
					path: "/account",
					Component: Account,
					loader: () => ({
						user: { ...MOCK_USER, image: null, photoUrl: null },
					}),
				},
			],
			isAuth: true,
			initialEntries: ["/account"],
		});

		await waitFor(() => {
			// Check that user information is displayed
			expect(screen.getByText(MOCK_USER.name!)).toBeInTheDocument();
			expect(screen.getByText(MOCK_USER.email)).toBeInTheDocument();

			// Check for membership duration text
			expect(screen.getByText(/Member since/i)).toBeInTheDocument();

			// Check for avatar placeholder since no avatar is provided
			expect(screen.getByTestId("user-circle-icon")).toBeInTheDocument();

			// Check for delete account button
			expect(screen.getByText("Delete account")).toBeInTheDocument();
			expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
		});
	});

	test("shows avatar when user has one", async () => {
		renderWithRouter({
			routes: [
				{
					path: "/account",
					Component: Account,
					loader: () => ({ user: getMockUser() }),
				},
			],
			isAuth: true,
			initialEntries: ["/account"],
		});

		await waitFor(() => {
			// Look for the avatar image
			const avatar = screen.getByAltText("user avatar");
			expect(avatar).toBeInTheDocument();
			expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");

			// UserCircle icon shouldn't be present
			expect(screen.queryByTestId("user-circle-icon")).not.toBeInTheDocument();
		});
	});

	test("shows error alert when deletion has error", async () => {
		testServer.use(
			http.delete(`${baseURL}/user`, () => {
				return HttpResponse.json(
					{ error: "Failed to delete account" },
					{ status: 500 },
				);
			}),
		);

		renderWithRouter({
			routes: [
				{
					path: "/account",
					Component: Account,
					loader: () => ({ user: getMockUser() }),
				},
			],
			isAuth: true,
			initialEntries: ["/account"],
		});

		await waitFor(() => {
			expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
		});

		// Click the delete account button
		screen.getByTestId("delete-account-form").click();

		await waitFor(() => {
			expect(screen.getByTestId("delete-account-error")).toBeInTheDocument();
		});
	});
});
