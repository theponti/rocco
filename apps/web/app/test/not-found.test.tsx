import { screen } from "@testing-library/react";
import { renderWithProviders } from "app/test/utils";
import { describe, expect, test, vi } from "vitest";

function mockUseMatch(paths: { [key: string]: boolean }) {
	const mockReactRouter = vi.mocked({
		useMatch: vi.fn((path) => paths[path] ?? false),
	});
	return mockReactRouter;
}

// Import after mocks are set up
import NotFound from "~/routes/not-found";

describe("not-found", () => {
	test("should render not found for invites route", () => {
		mockUseMatch({ "/invites": true });
		renderWithProviders(<NotFound />);

		expect(
			screen.getByText("Sign up to start making lists with friends!"),
		).toBeInTheDocument();
	});

	test("should render NotFound for invite route", () => {
		mockUseMatch({ "/invites/:id": true });
		renderWithProviders(<NotFound />);

		expect(
			screen.getByText("This invite could not be found."),
		).toBeInTheDocument();
	});

	test("should render not found for list route", () => {
		mockUseMatch({ "/list/:id": true });
		renderWithProviders(<NotFound />);

		expect(
			screen.getByText("This list could not be found."),
		).toBeInTheDocument();
	});
});
