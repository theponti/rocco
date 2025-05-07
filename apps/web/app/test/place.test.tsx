import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { baseURL } from "~/lib/api/base";
import { MOCK_PLACE } from "~/test/mocks/place";
import { testServer } from "~/test/test.setup";
import { renderWithRouter } from "~/test/utils";

import RootLayout from "../routes/layout";
import Place from "../routes/place/index";
import { PlaceLayout } from "../routes/place/layout";

describe("Place Page", () => {
	const placeId = MOCK_PLACE.googleMapsId;

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock the API request for fetching place data
		testServer.use(
			http.get(`${baseURL}/places/${placeId}`, () => {
				return HttpResponse.json(MOCK_PLACE);
			}),
		);
	});

	test("should render place details", async () => {
		// Render with our improved router setup
		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: RootLayout,
					children: [
						{
							path: "place",
							Component: PlaceLayout,
							children: [
								{
									path: ":id",
									Component: Place,
									loader: async () => ({ place: MOCK_PLACE }),
								},
							],
						},
					],
				},
			],
			initialEntries: [`/place/${placeId}`],
		});

		// Verify the place information is displayed
		await waitFor(() => {
			expect(screen.getByText(MOCK_PLACE.name)).toBeInTheDocument();
		});

		const section = within(screen.getByTestId("place-page"));

		// Verify the place address is displayed
		expect(section.getByText(MOCK_PLACE.address)).toBeInTheDocument();

		// Verify the place types are displayed
		expect(section.getByText("test type")).toBeInTheDocument();
	});
});
