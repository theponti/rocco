import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PlaceItem from "~/components/places/place-item";
import { getMockPlace } from "~/test/mocks";
import { mockTrpcClient, renderWithRouter } from "~/test/utils";

describe("PlaceItem", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("renders place item with basic information", async () => {
		const mockPlace = getMockPlace();
		// Convert to ListPlace type
		const listPlace = {
			id: mockPlace.id,
			imageUrl: mockPlace.imageUrl,
			name: mockPlace.name,
			googleMapsId: mockPlace.googleMapsId,
			types: mockPlace.types,
			description: mockPlace.description || "",
			address: mockPlace.address,
			latitude: mockPlace.latitude || 37.7749,
			longitude: mockPlace.longitude || -122.4194,
			phoneNumber: mockPlace.phoneNumber,
			rating: mockPlace.rating,
			websiteUri: mockPlace.websiteUri,
			bestFor: mockPlace.bestFor,
			wifiInfo: mockPlace.wifiInfo,
			photos: mockPlace.photos,
			priceLevel: mockPlace.priceLevel,
		};

		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: () => (
						<PlaceItem
							place={listPlace}
							listId="test-list-id"
							onRemove={() => {}}
						/>
					),
				},
			],
		});

		await waitFor(() => {
			expect(screen.getByText(mockPlace.name)).toBeInTheDocument();
		});
	});

	test("calls onRemove when remove button is clicked", async () => {
		const mockPlace = getMockPlace();
		const onRemove = vi.fn();
		const listPlace = {
			id: mockPlace.id,
			imageUrl: mockPlace.imageUrl,
			name: mockPlace.name,
			googleMapsId: mockPlace.googleMapsId,
			types: mockPlace.types,
			description: mockPlace.description || "",
			address: mockPlace.address,
			latitude: mockPlace.latitude || 37.7749,
			longitude: mockPlace.longitude || -122.4194,
			phoneNumber: mockPlace.phoneNumber,
			rating: mockPlace.rating,
			websiteUri: mockPlace.websiteUri,
			bestFor: mockPlace.bestFor,
			wifiInfo: mockPlace.wifiInfo,
			photos: mockPlace.photos,
			priceLevel: mockPlace.priceLevel,
		};

		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: () => (
						<PlaceItem
							place={listPlace}
							listId="test-list-id"
							onRemove={onRemove}
						/>
					),
				},
			],
		});

		await waitFor(() => {
			expect(screen.getByText(mockPlace.name)).toBeInTheDocument();
		});

		// Find and click the dropdown menu trigger
		const dropdownButton = screen.getByRole("button", { expanded: false });
		await userEvent.click(dropdownButton);

		// Find and click the remove option
		const removeButton = screen.getByText("Remove from list");
		await userEvent.click(removeButton);

		// Click the confirm delete button
		const confirmButton = screen.getByTestId("place-delete-confirm-button");
		await userEvent.click(confirmButton);

		expect(onRemove).toHaveBeenCalled();
	});

	test("displays photos when available", async () => {
		const mockPlace = getMockPlace();
		const listPlace = {
			id: mockPlace.id,
			imageUrl: null, // Set to null to test photos
			name: mockPlace.name,
			googleMapsId: mockPlace.googleMapsId,
			types: mockPlace.types,
			description: mockPlace.description || "",
			address: mockPlace.address,
			latitude: mockPlace.latitude || 37.7749,
			longitude: mockPlace.longitude || -122.4194,
			phoneNumber: mockPlace.phoneNumber,
			rating: mockPlace.rating,
			websiteUri: mockPlace.websiteUri,
			bestFor: mockPlace.bestFor,
			wifiInfo: mockPlace.wifiInfo,
			photos: ["test-photo-url-1", "test-photo-url-2"],
			priceLevel: mockPlace.priceLevel,
		};

		renderWithRouter({
			routes: [
				{
					path: "/",
					Component: () => (
						<PlaceItem
							place={listPlace}
							listId="test-list-id"
							onRemove={() => {}}
						/>
					),
				},
			],
		});

		await waitFor(() => {
			expect(screen.getByText(mockPlace.name)).toBeInTheDocument();
		});

		// Check that the first photo is displayed
		const photoImage = screen.getByAltText(mockPlace.name);
		expect(photoImage).toHaveAttribute("src", "test-photo-url-1");
	});
});
