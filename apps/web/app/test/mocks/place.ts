import { http, HttpResponse } from "msw";
import { createElement } from "react";
import { vi } from "vitest";

import { baseURL } from "~/lib/api/base";
import type { ListPlace, Place } from "~/lib/types";

vi.mock("@vis.gl/react-google-maps", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...(actual as any),
		useApiIsLoaded: () => true,
		useApiLoadingStatus: vi.fn(),
		Map: () => createElement("div", { "data-testid": "google-map" }),
	};
});

export const PLACE_ID = "place-id";

export const MOCK_PLACE: Place = {
	id: PLACE_ID,
	googleMapsId: "123",
	name: "test place",
	imageUrl: "test-image-url",
	types: ["test_type"],
	address: "123 Test Street, Test City",
	phoneNumber: "+1 (123) 456-7890",
	latitude: 123.456,
	longitude: 789.012,
	photos: ["test-photo-url-1", "test-photo-url-2"],
	price_level: 2,
	rating: 4.5,
	websiteUri: "https://test-place.example.com",
	lists: [],
};

// Create a mock place that conforms to ListPlace type
export const MOCK_LIST_PLACE: ListPlace = {
	id: MOCK_PLACE.id,
	itemId: MOCK_PLACE.id,
	imageUrl: MOCK_PLACE.imageUrl,
	name: MOCK_PLACE.name,
	googleMapsId: MOCK_PLACE.googleMapsId,
	types: MOCK_PLACE.types,
	description: "Test place description",
};

export const MOCK_PLACE_SEARCH = [
	{
		googleMapsId: "place-id",
		name: "New York",
		latitude: 456,
		longitude: 678,
	},
];

export const AUTH_HANDLERS = [
	http.get(`${baseURL}/me`, () => {
		return HttpResponse.json({
			email: "test@test.com",
			id: "test-id",
		});
	}),
];

export const PLACE_HANDLERS = [
	http.get(`${baseURL}/places/123`, () => {
		return HttpResponse.json(MOCK_PLACE);
	}),
	http.delete(`${baseURL}/lists/:listId/place/:placeId`, () => {
		return HttpResponse.json({ success: true });
	}),
	http.get(`${baseURL}/places/search`, () => {
		return HttpResponse.json(MOCK_PLACE_SEARCH);
	}),
];
