import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import LandingPage from "app/routes/index";
import { renderWithRouter } from "app/test/utils";

describe("landing", () => {
	test("renders", () => {
		renderWithRouter({
			isAuth: false,
			routes: [
				{
					path: "/",
					Component: LandingPage,
				},
			],
			initialEntries: ["/"],
		});

		const heading = screen.getByTestId("home-header");
		expect(heading).toBeInTheDocument();
	});
});
