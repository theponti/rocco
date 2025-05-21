import { useUser } from "@clerk/react-router";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";
import { href, useLoaderData, useNavigate } from "react-router";

import Lists from "~/components/lists-components/lists";
import LazyMap from "~/components/map.lazy";
import PlaceDrawer from "~/components/places/place-drawer";
import PlacesAutocomplete from "~/components/places/places-autocomplete";
import { useGeolocation } from "~/hooks/useGeolocation";
import type { GooglePlacePrediction } from "~/hooks/useGooglePlacesAutocomplete";
import { api, baseURL } from "~/lib/api/base";
import type { List, Place, PlaceLocation } from "~/lib/types";
import { requireAuth } from "~/routes/guards";
import type { Route } from "./+types";

/**
 * Define a default location in case geolocation fails or is loading
 * Default: San Francisco
 */
const DEFAULT_LOCATION: PlaceLocation = {
	latitude: 37.7749,
	longitude: -122.4194,
};

export async function loader(loaderArgs: Route.ClientLoaderArgs) {
	const response = await requireAuth(loaderArgs);

	if ("getToken" in response) {
		const token = await response.getToken();

		try {
			const res = await api.get<{ lists: List[] }>(
				`${baseURL}/lists?itemType=PLACE`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			return {
				lists: res.data.lists.map((list) => ({
					...list,
					isOwnList: list.userId === response.userId,
				})),
			};
		} catch (error) {
			throw new Response("Could not load lists.", { status: 500 });
		}
	}
}

export const ZOOM_LEVELS = {
	DEFAULT: 10,
	SELECTED: 19,
	MARKER: 18,
};

function Dashboard() {
	const { lists } = useLoaderData() as { lists: List[] };
	const { currentLocation, isLoading: isLoadingLocation } = useGeolocation();
	const [selected, setSelected] = useState<Place | null>(null);
	const [isPlaceDrawerOpen, setIsPlaceDrawerOpen] = useState(false);
	// Initialize center state with currentLocation or default
	const [center, setCenter] = useState<PlaceLocation>(
		currentLocation ?? DEFAULT_LOCATION,
	);
	const navigate = useNavigate();

	// Update map center based on geolocation
	useEffect(() => {
		if (currentLocation) {
			setCenter(currentLocation);
		}
	}, [currentLocation]);

	const onMapClick = useCallback(
		async (args: MapMouseEvent) => {
			if (!args.detail.placeId) {
				return;
			}
			navigate(href("/places/:id", { id: args.detail.placeId }));
		},
		[navigate],
	);

	const onSelectedChanged = useCallback((info: GooglePlacePrediction) => {
		// Convert GooglePlacePrediction to Place type
		if (info.location) {
			// Map the GooglePlacePrediction to a Place object
			const placeData: Place = {
				id: info.place_id,
				googleMapsId: info.place_id,
				name: info.structured_formatting.main_text,
				address: info.structured_formatting.secondary_text,
				latitude: info.location.latitude,
				longitude: info.location.longitude,
				// Default values for required Place properties
				imageUrl: "",
				phoneNumber: "",
				photos: [],
				price_level: info.priceLevel ? Number.parseInt(info.priceLevel, 10) : 0,
				rating: 0,
				types: [], // Default to empty array
				websiteUri: "",
			};

			setCenter(info.location);
			setSelected(placeData);
			setIsPlaceDrawerOpen(true); // Open the drawer when a place is selected
		}
	}, []);

	const onMarkerClick = useCallback(() => {
		if (!selected) {
			return;
		}
		navigate(href("/places/:id", { id: selected.googleMapsId }));
	}, [navigate, selected]);

	return (
		<div
			className="flex flex-col gap-4 w-full h-full pb-8 md:max-w-3xl md:mx-auto"
			data-testid="dashboard-scene"
		>
			<div>
				{currentLocation ? (
					<PlacesAutocomplete
						apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
						setSelected={onSelectedChanged}
						center={currentLocation}
					/>
				) : (
					// Optional: Show a loading state or placeholder while location is loading
					<div>Loading location for search...</div>
				)}
			</div>
			<div className="min-h-60 h-60">
				<LazyMap
					isLoadingCurrentLocation={isLoadingLocation}
					zoom={ZOOM_LEVELS.DEFAULT}
					center={center}
					onMapClick={onMapClick}
					onMarkerClick={onMarkerClick}
					setSelected={setSelected}
				/>
			</div>

			{lists ? <Lists status={"success"} lists={lists} error={null} /> : null}

			{/* Place Drawer */}
			<PlaceDrawer
				place={selected}
				isOpen={isPlaceDrawerOpen}
				onOpenChange={setIsPlaceDrawerOpen}
				lists={lists || []}
			/>
		</div>
	);
}

export function ErrorBoundary(errorArgs: Route.ErrorBoundaryProps) {
	return (
		<div className="flex flex-col items-center justify-center h-full text-white">
			<h2>Something went wrong while loading the dashboard.</h2>
			<p>Please try again later.</p>
		</div>
	);
}

export default Dashboard;
