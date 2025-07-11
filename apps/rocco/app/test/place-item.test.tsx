import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PlaceItem from "~/components/places/place-item";
import { baseURL } from "~/lib/api/base";
import { getMockPlace } from "~/test/mocks";
import { testServer } from "~/test/test.setup";
import { renderWithRouter } from "~/test/utils";

// Mock the navigation function
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
	const actual = await vi.importActual("react-router");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe("PlaceItem", () => {
	const place = getMockPlace();
	const listId = "test-list-id";

	beforeEach(() => {
		vi.clearAllMocks();
		mockNavigate.mockClear();
		testServer.use(
			http.delete(
				`${baseURL}/lists/${listId}/items/${place.googleMapsId}`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
	});

	test("renders place information", async () => {
		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: () => (
						<PlaceItem
							place={place}
							listId={listId}
							onRemove={vi.fn()}
							onError={vi.fn()}
						/>
					),
				},
			],
			initialEntries: ["/"],
		});
		await waitFor(() => {
			expect(screen.getByText(place.name)).toBeInTheDocument();
		});
		
		// Check that place types are rendered
		const placeTypes = screen.getAllByTestId("place-type");
		if (place.types && place.types.length >= 2) {
			expect(placeTypes.at(0)).toHaveTextContent(place.types[0]);
			expect(placeTypes.at(1)).toHaveTextContent(place.types[1]);
		}
	});

	test("shows delete modal when delete button is clicked", async () => {
		const user = userEvent.setup();
		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: () => (
						<PlaceItem
							place={place}
							listId={listId}
							onRemove={vi.fn()}
							onError={vi.fn()}
						/>
					),
				},
			],
			initialEntries: ["/"],
		});
		
		// Find the dropdown trigger button (MoreVertical icon)
		const moreButton = screen.getByRole("button", { 
			expanded: false 
		});
		
		// Click the dropdown button and prevent event bubbling
		await user.click(moreButton);
		
		// Find and click the "Remove from list" option
		const removeButton = screen.getByText("Remove from list");
		await user.click(removeButton);
		
		// Check that the delete modal appears
		const deleteModal = await screen.findByTestId("place-delete-modal");
		expect(deleteModal).toBeInTheDocument();
		expect(
			screen.getByTestId("place-delete-confirm-button"),
		).toBeInTheDocument();
	});

	test("calls onRemove when confirm delete is clicked", async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();
		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: () => (
						<PlaceItem
							place={place}
							listId={listId}
							onRemove={onRemove}
							onError={vi.fn()}
						/>
					),
				},
			],
			initialEntries: ["/"],
		});
		
		// Find the dropdown trigger button
		const moreButton = screen.getByRole("button", { 
			expanded: false 
		});
		await user.click(moreButton);
		
		// Find and click the "Remove from list" option
		const removeButton = screen.getByText("Remove from list");
		await user.click(removeButton);
		
		// Click the confirm delete button
		const confirmButton = await screen.findByTestId(
			"place-delete-confirm-button",
		);
		await user.click(confirmButton);
		
		// Wait for the onRemove callback to be called
		await waitFor(() => {
			expect(onRemove).toHaveBeenCalled();
		});
	});
});
