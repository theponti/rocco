import { screen } from "@testing-library/react";
import { mockUseAuth, renderWithProviders } from "src/test/utils";
import { describe, expect, test } from "vitest";

import Layout from "src/layout";
import LandingPage from "src/scenes";

describe("landing", () => {
	test("renders", () => {
		renderWithProviders(<LandingPage />);
		expect(screen.getByText("Make the world yours.")).toBeInTheDocument();
	});
	test("should render log in button if user is not logged in", () => {
		renderWithProviders(<Layout />);
		expect(screen.getByText("Log In")).toBeTruthy();
	});
	test("should render auth nav menu if user is logged in", () => {
		mockUseAuth(true);
		renderWithProviders(<Layout />);
		expect(screen.getByTestId("auth-dropdown-button")).toBeTruthy();
	});
});
