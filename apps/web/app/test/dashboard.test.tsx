import { screen, waitFor } from "@testing-library/react";
import * as googleMaps from "@vis.gl/react-google-maps";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { baseURL } from "app/lib/api/base";
import { testServer } from "app/test/test.setup";
import { getMockLists, renderWithProviders } from "app/test/utils";

// Import after mocks are set up
import Dashboard from "../routes/dashboard";

describe("Dashboard", () => {
	beforeEach(() => {
		testServer.use(
			http.get(`${baseURL}/lists`, () => HttpResponse.json(getMockLists())),
		);
	});

	test("renders the loading spinner when map is not loaded", async () => {
		vi.spyOn(googleMaps, "useApiLoadingStatus").mockReturnValue(
			googleMaps.APILoadingStatus.LOADING,
		);
		renderWithProviders(
			<Dashboard
				loaderData={{ lists: getMockLists() }}
				matches={[]}
				params={{}}
			/>,
			{ isAuth: true },
		);

		await waitFor(() => {
			expect(screen.queryByTestId("loading-spinner")).toBeInTheDocument();
		});
	});

	test("renders the places autocomplete and RoccoMap when map is loaded", async () => {
		vi.spyOn(googleMaps, "useApiLoadingStatus").mockReturnValue(
			googleMaps.APILoadingStatus.LOADED,
		);
		renderWithProviders(
			<Dashboard
				loaderData={{ lists: getMockLists() }}
				matches={[]}
				params={{}}
			/>,
			{ isAuth: true },
		);
		await waitFor(() => {
			expect(screen.queryByTestId("places-autocomplete")).toBeInTheDocument();
			expect(screen.queryByTestId("rocco-map")).toBeInTheDocument();
		});
	});

	test("renders lists", async () => {
		const lists = getMockLists();
		vi.spyOn(googleMaps, "useApiLoadingStatus").mockReturnValue(
			googleMaps.APILoadingStatus.LOADED,
		);
		renderWithProviders(
			<Dashboard
				loaderData={{ lists: getMockLists() }}
				matches={[]}
				params={{}}
			/>,
			{ isAuth: true },
		);

		await waitFor(() => {
			expect(screen.queryByTestId("lists")).toBeInTheDocument();
			expect(screen.queryByText(lists[0].name)).toBeInTheDocument();
			expect(screen.queryByText(lists[1].name)).toBeInTheDocument();
		});
	});
});
