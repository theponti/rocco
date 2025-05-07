import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PlaceItem from "app/components/places/place-item";
import { baseURL } from "app/lib/api/base";
import { getMockPlace } from "app/test/mocks";
import { testServer } from "app/test/test.setup";
import { renderWithRouter } from "app/test/utils";

describe("PlaceItem", () => {
	const place = getMockPlace();
	const listId = "test-list-id";

	beforeEach(() => {
		vi.clearAllMocks();
		testServer.use(
			http.delete(
				`${baseURL}/lists/${listId}/items/${place.id}`,
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
							onDelete={vi.fn()}
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
		const section = within(screen.getByTestId("place-item"));
		const placeTypes = section.getAllByTestId("place-type");
		expect(placeTypes.at(0)).toHaveTextContent(place.types[0]);
		expect(placeTypes.at(1)).toHaveTextContent(place.types[1]);
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
							onDelete={vi.fn()}
							onError={vi.fn()}
						/>
					),
				},
			],
			initialEntries: ["/"],
		});
		const moreButton = screen.getByTestId("place-dropdownmenu-trigger");
		await user.click(moreButton);
		const deleteButton = await screen.findByTestId("place-delete-button");
		await user.click(deleteButton);
		const deleteModal = await screen.findByTestId("place-delete-modal");
		expect(deleteModal).toBeInTheDocument();
		expect(
			screen.getByTestId("place-delete-confirm-button"),
		).toBeInTheDocument();
	});

	test("calls onDelete when confirm delete is clicked", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: () => (
						<PlaceItem
							place={place}
							listId={listId}
							onDelete={onDelete}
							onError={vi.fn()}
						/>
					),
				},
			],
			initialEntries: ["/"],
		});
		const moreButton = screen.getByTestId("place-dropdownmenu-trigger");
		await user.click(moreButton);
		const deleteButton = await screen.findByTestId("place-delete-button");
		await user.click(deleteButton);
		const confirmButton = await screen.findByTestId(
			"place-delete-confirm-button",
		);
		await user.click(confirmButton);
		await waitFor(() => {
			expect(onDelete).toHaveBeenCalledWith(place.id);
		});
	});
});
