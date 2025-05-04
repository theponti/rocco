import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { TEST_USER_NAME, renderWithProviders } from "~/test/utils";

// Mock authentication hooks
vi.mock("@clerk/react-router", () => ({
	useAuth: () => ({ userId: "user-id", isLoaded: true, isSignedIn: true }),
	useUser: () => ({
		user: {
			fullName: TEST_USER_NAME,
			firstName: "Test",
			lastName: "User",
			primaryEmailAddress: { emailAddress: "test@example.com" },
		},
		isLoaded: true,
	}),
}));

// Import after mocks are set up
import Account from "~/routes/account";

describe("Account", () => {
	test("renders when loading = true", async () => {
		renderWithProviders(
			<Account
				loaderData={{ user: { name: TEST_USER_NAME } }}
				matches={[]}
				params={{}}
			/>,
			{ isAuth: true },
		);

		await waitFor(() => {
			expect(screen.queryByText(TEST_USER_NAME)).toBeInTheDocument();
		});
	});
});
