import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Account from "~/routes/account";
import { getMockUser } from "~/test/mocks/index";
import { mockTrpcClient, renderWithRouter } from "~/test/utils";

// Create a mock user
const mockUser = getMockUser();

// Create a user object with the user_metadata structure expected by the component
const MOCK_USER = {
	...mockUser,
	user_metadata: {
		name: mockUser.name,
		image: mockUser.image,
		picture: mockUser.photoUrl,
	},
};

// Mock loader data that will be customized by each test
let mockLoaderData = { user: MOCK_USER };

// Mock React Router's useLoaderData hook
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useLoaderData: () => mockLoaderData,
	};
});

describe("Account", () => {
	test("renders account page with user information", async () => {
		// For this specific test, create a mock user with no images
		const userWithoutImage = {
			...mockUser,
			image: null,
			photoUrl: null,
		};

		const mockUserData = {
			...userWithoutImage,
			user_metadata: {
				name: userWithoutImage.name,
				image: null,
				picture: null,
			},
		};

		// Update loader data to use user without image
		mockLoaderData.user = mockUserData;

		// Mock user profile query
		vi.mocked(mockTrpcClient.user.getProfile.useQuery).mockReturnValue({
			data: mockUserData,
			isLoading: false,
			error: null,
		} as any);

		// Mock delete account mutation
		const mockDeleteMutation = {
			mutate: vi.fn(),
			isPending: false,
			isLoading: false,
			isError: false,
			error: null,
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
		// Ensure mockLoaderData has the image for this test
		mockLoaderData = {
			user: {
				...MOCK_USER,
				user_metadata: {
					...MOCK_USER.user_metadata,
					image: "https://example.com/avatar.jpg",
					picture: null,
				},
			},
		};

		// Mock user profile query with avatar
		vi.mocked(mockTrpcClient.user.getProfile.useQuery).mockReturnValue({
			data: mockLoaderData.user,
			isLoading: false,
			error: null,
		} as any);

		// Mock delete account mutation
		const mockDeleteMutation = {
			mutate: vi.fn(),
			isPending: false,
			isLoading: false,
			isError: false,
			error: null,
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
			data: MOCK_USER,
			isLoading: false,
			error: null,
		} as any);

		// Mock delete account mutation to throw error
		const mockDeleteMutation = {
			mutate: vi.fn(),
			isPending: false,
			isLoading: false, // For backward compatibility
			isError: true,
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
