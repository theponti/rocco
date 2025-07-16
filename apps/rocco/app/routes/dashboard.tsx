import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";
import { href, useNavigate } from "react-router";

import Lists from "~/components/lists-components/lists";
import LazyMap from "~/components/map.lazy";
import PlaceDrawer from "~/components/places/place-drawer";
import PlacesAutocomplete from "~/components/places/places-autocomplete";
import { useGeolocation } from "~/hooks/useGeolocation";
import type { GooglePlacePrediction } from "~/hooks/useGooglePlacesAutocomplete";
import { trpc } from "~/lib/trpc/client";
import type { GooglePlaceData, Place, PlaceLocation } from "~/lib/types";
import { requireAuth } from "~/routes/guards";

/**
 * Define a default location in case geolocation fails or is loading
 * Default: San Francisco
 */
const DEFAULT_LOCATION: PlaceLocation = {
	latitude: 37.7749,
	longitude: -122.4194,
};

export async function loader(loaderArgs: any) {
	const response = await requireAuth(loaderArgs);

	if ("getToken" in response) {
		// For now, return empty data and let the client fetch with tRPC
		return {
			lists: [],
		};
	}
}

export const ZOOM_LEVELS = {
	DEFAULT: 10,
	SELECTED: 19,
	MARKER: 18,
};

function Dashboard() {
	const { currentLocation, isLoading: isLoadingLocation } = useGeolocation();
	const [selected, setSelected] = useState<Place | GooglePlaceData | null>(
		null,
	);
	const [isPlaceDrawerOpen, setIsPlaceDrawerOpen] = useState(false);
	// Initialize center state with currentLocation or default
	const [center, setCenter] = useState<PlaceLocation>(
		currentLocation ?? DEFAULT_LOCATION,
	);
	const navigate = useNavigate();

	const { mutateAsync: getOrCreatePlace } =
		trpc.places.getOrCreateByGoogleMapsId.useMutation();

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

			try {
				// Get or create the place in our database
				const place = await getOrCreatePlace({
					googleMapsId: args.detail.placeId,
				});
				// Navigate to the place page using our database ID
				navigate(href("/places/:id", { id: place.id }));
			} catch (error) {
				console.error("Failed to get or create place:", error);
				// Fallback: navigate with Google Maps ID (will show error if place doesn't exist)
				navigate(href("/places/:id", { id: args.detail.placeId }));
			}
		},
		[navigate, getOrCreatePlace],
	);

	const onSelectedChanged = useCallback((info: GooglePlacePrediction) => {
		// Convert GooglePlacePrediction to GooglePlaceData type
		if (info.location) {
			// Map the GooglePlacePrediction to a GooglePlaceData object
			const placeData: GooglePlaceData = {
				id: info.place_id,
				googleMapsId: info.place_id,
				name: info.structured_formatting.main_text,
				address: info.structured_formatting.secondary_text || null,
				latitude: info.location.latitude,
				longitude: info.location.longitude,
				description: null,
				types: null,
				imageUrl: null,
				phoneNumber: null,
				rating: null,
				websiteUri: null,
				bestFor: null,
				wifiInfo: null,
			};

			setCenter(info.location);
			setSelected(placeData);
			setIsPlaceDrawerOpen(true); // Open the drawer when a place is selected
		}
	}, []);

	const onMarkerClick = useCallback(async () => {
		if (!selected) return;

		// If the selected place is already a Place (from our database), use its ID
		if ("userId" in selected) {
			navigate(href("/places/:id", { id: selected.id }));
			return;
		}

		// If it's a GooglePlaceData, get or create it in our database
		const placeId = selected.googleMapsId ?? selected.id;
		try {
			const place = await getOrCreatePlace({ googleMapsId: placeId });
			navigate(href("/places/:id", { id: place.id }));
		} catch (error) {
			console.error("Failed to get or create place:", error);
			// Fallback: navigate with Google Maps ID
			navigate(href("/places/:id", { id: placeId }));
		}
	}, [navigate, selected, getOrCreatePlace]);

	return (
		<div
			className="flex flex-col gap-4 w-full h-full pb-8 md:max-w-3xl md:mx-auto"
			data-testid="dashboard-scene"
		>
			<div className="relative min-h-12 z-10">
				<PlacesAutocomplete
					apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
					setSelected={onSelectedChanged}
					center={currentLocation}
				/>
			</div>
			<div className="min-h-60 h-60">
				<LazyMap
					isLoadingCurrentLocation={isLoadingLocation}
					zoom={ZOOM_LEVELS.DEFAULT}
					center={center}
					markers={[{ latitude: center.latitude, longitude: center.longitude }]}
					onMapClick={onMapClick}
					onMarkerClick={onMarkerClick}
					setSelected={setSelected}
				/>
			</div>

			<Lists />

			{/* Place Drawer */}
			<PlaceDrawer
				place={selected}
				isOpen={isPlaceDrawerOpen}
				onOpenChange={setIsPlaceDrawerOpen}
			/>
		</div>
	);
}

export function ErrorBoundary(errorArgs: any) {
	return (
		<div className="flex flex-col items-center justify-center h-full text-gray-900">
			<h2>Something went wrong while loading the dashboard.</h2>
			<p>Please try again later.</p>
		</div>
	);
}

export default Dashboard;
