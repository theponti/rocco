import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Account from "~/routes/account";
import { getMockUser } from "~/test/mocks/index";
import { mockTrpcClient, renderWithRouter } from "~/test/utils";

const MOCK_USER = getMockUser();

describe("Account", () => {
	test("renders account page with user information", async () => {
		// Mock user profile query
		vi.mocked(mockTrpcClient.user.getProfile.useQuery).mockReturnValue({
			data: { ...MOCK_USER, image: null, photoUrl: null },
			isLoading: false,
			error: null,
		} as any);

		renderWithRouter({
			routes: [
				{
					path: "/account",
					Component: Account,
				},
			],
			isAuth: true,
			initialEntries: ["/account"],
		});

		await waitFor(() => {
			// Check that user information is displayed
			expect(screen.getByText(MOCK_USER.name || "")).toBeInTheDocument();
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
		// Mock user profile query with avatar
		vi.mocked(mockTrpcClient.user.getProfile.useQuery).mockReturnValue({
			data: getMockUser(),
			isLoading: false,
			error: null,
		} as any);

		renderWithRouter({
			routes: [
				{
					path: "/account",
					Component: Account,
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
		// Mock user profile query
		vi.mocked(mockTrpcClient.user.getProfile.useQuery).mockReturnValue({
			data: getMockUser(),
			isLoading: false,
			error: null,
		} as any);

		// Mock delete account mutation to throw error
		const mockDeleteMutation = {
			mutate: vi.fn(),
			isLoading: false,
			error: { message: "Failed to delete account" },
		};
		vi.mocked(mockTrpcClient.user.deleteAccount.useMutation).mockReturnValue(
			mockDeleteMutation as any,
		);

		renderWithRouter({
			routes: [
				{
					path: "/account",
					Component: Account,
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
