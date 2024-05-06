import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test } from "vitest";

import Dashboard from "src/routes/dashboard";
import { baseURL } from "src/services/api/base";
import { testServer } from "src/test/test.setup";
import { getMockLists, renderWithProviders } from "src/test/utils";

describe("Dashboard", () => {
	beforeEach(() => {
		testServer.use(
			http.get(`${baseURL}/lists`, () => HttpResponse.json(getMockLists())),
		);
	});

	test("renders the loading spinner when map is not loaded", () => {
		renderWithProviders(<Dashboard isMapLoaded={false} />);
		expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
	});

	test("renders the places autocomplete and RoccoMap when map is loaded", () => {
		renderWithProviders(<Dashboard isMapLoaded={true} />);
		expect(screen.getByTestId("places-autocomplete")).toBeInTheDocument();
		expect(screen.getByTestId("rocco-map")).toBeInTheDocument();
	});

	test("renders lists", async () => {
		const lists = getMockLists();
		renderWithProviders(<Dashboard isMapLoaded={true} />);

		await waitFor(() => {
			expect(screen.getByTestId("lists")).toBeInTheDocument();
			expect(screen.getByText(lists[0].name)).toBeInTheDocument();
			expect(screen.getByText(lists[1].name)).toBeInTheDocument();
		});
	});
});
