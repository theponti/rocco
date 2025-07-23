import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import LazyMap from "~/components/map.lazy";
import PlaceDrawer from "~/components/places/place-drawer";
import PlacesAutocomplete from "~/components/places/places-autocomplete";
import { useGeolocation } from "~/hooks/useGeolocation";
import { trpc } from "~/lib/trpc/client";
import type { Place, PlaceLocation } from "~/lib/types";
import { cn } from "~/lib/utils";
import { fetchPlaceDetails } from "../lib/fetchPlaceDetails";

const ZOOM_LEVELS = {
	DEFAULT: 15,
	CLOSE: 18,
	CITY: 12,
};

interface MapLayoutProps {
	children: React.ReactNode;
}

export default function MapLayout({ children }: MapLayoutProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();
	const { currentLocation, isLoading: isLoadingLocation } = useGeolocation();

	const [selected, setSelected] = useState<Place | null>(null);
	const [isPlaceDrawerOpen, setIsPlaceDrawerOpen] = useState(false);
	const [center, setCenter] = useState<PlaceLocation>({
		latitude: 40.7831,
		longitude: -73.9712,
	});

	// Get place data if we're on a place route
	const isPlaceRoute = location.pathname.startsWith("/places/");
	const isListRoute = location.pathname.startsWith("/lists/");
	const placeId = isPlaceRoute ? params.id : null;
	const listId = isListRoute ? params.id : null;

	const { data: currentPlace } = trpc.places.getById.useQuery(
		{ id: placeId || "" },
		{ enabled: !!placeId && placeId.length > 10 }, // Only query if placeId looks like a UUID
	);

	const { data: currentPlaceByGoogleId } =
		trpc.places.getByGoogleMapsId.useQuery(
			{ googleMapsId: placeId || "" },
			{ enabled: !!placeId && placeId.length <= 10 }, // Only query if placeId looks like a Google Maps ID
		);

	const { data: currentList } = trpc.lists.getById.useQuery(
		{ id: listId || "" },
		{ enabled: !!listId },
	);

	const place = currentPlace || currentPlaceByGoogleId;

	// Update map center based on current place/list or geolocation
	useEffect(() => {
		if (place?.latitude && place?.longitude) {
			setCenter({ latitude: place.latitude, longitude: place.longitude });
		} else if (currentList?.places && currentList.places.length > 0) {
			// Center on the first place in the list that has coordinates
			const firstPlaceWithCoords = currentList.places.find(
				(p) => p.latitude && p.longitude,
			);
			if (firstPlaceWithCoords?.latitude && firstPlaceWithCoords?.longitude) {
				setCenter({
					latitude: firstPlaceWithCoords.latitude,
					longitude: firstPlaceWithCoords.longitude,
				});
			}
		} else if (currentLocation) {
			setCenter(currentLocation);
		}
	}, [place, currentList, currentLocation]);

	const getOrCreatePlace = trpc.places.getOrCreateByGoogleMapsId.useMutation();

	const onMapClick = useCallback(
		async (args: MapMouseEvent) => {
			const { placeId } = args.detail;

			if (placeId) {
				try {
					const place = await getOrCreatePlace.mutateAsync({
						googleMapsId: placeId,
					});
					navigate(`/places/${place.id}`);
				} catch (error) {
					// Fallback: navigate with Google Maps ID (will show error if place doesn't exist)
					navigate(`/places/${placeId}`);
				}
			}
		},
		[getOrCreatePlace, navigate],
	);

	const onSelectedChanged = useCallback(async (info: any) => {
		if (!info) return;

		// Fetch up to 5 photo URLs from Google Places Details API
		let photoUrls: string[] = [];
		try {
			const details = await fetchPlaceDetails(info.place_id);
			photoUrls = details.photoUrls;
		} catch (e) {
			// Ignore errors, fallback to no photos
		}

		// Fill all Place fields with available info or null/defaults
		const placeData: Place = {
			id: info.place_id,
			name: info.structured_formatting?.main_text || info.description || "",
			description: null,
			address: info.description || "",
			createdAt: "",
			updatedAt: "",
			userId: "",
			itemId: null,
			googleMapsId: info.place_id,
			types: null,
			imageUrl: photoUrls[0] || null,
			phoneNumber: null,
			rating: null,
			websiteUri: null,
			latitude: null,
			longitude: null,
			location: [0, 0],
			bestFor: null,
			isPublic: false,
			wifiInfo: null,
			photos: photoUrls,
			priceLevel: null,
		};

		setSelected(placeData);
		setIsPlaceDrawerOpen(true);
	}, []);

	const onMarkerClick = useCallback(() => {
		if (selected) {
			navigate(`/places/${selected.id}`);
		}
	}, [selected, navigate]);

	// Determine if sidebar should be visible
	const showSidebar = location.pathname !== "/dashboard";

	// Determine markers to show
	const markers = [];
	if (place?.latitude && place?.longitude) {
		// Show single marker for place view
		markers.push({ latitude: place.latitude, longitude: place.longitude });
	} else if (currentList?.places && currentList.places.length > 0) {
		// Show markers for all places in the list that have coordinates
		for (const listPlace of currentList.places) {
			if (listPlace.latitude && listPlace.longitude) {
				markers.push({
					latitude: listPlace.latitude,
					longitude: listPlace.longitude,
				});
			}
		}
	} else {
		// Default marker at current location
		markers.push({ latitude: center.latitude, longitude: center.longitude });
	}

	return (
		<div className="flex-1 flex overflow-hidden">
			{/* Sidebar */}
			<div
				className={cn(
					"transition-all duration-300 ease-in-out overflow-hidden",
					showSidebar ? "w-96 border-r border-gray-200" : "w-0",
				)}
			>
				<div className="h-full overflow-y-auto bg-white">{children}</div>
			</div>

			{/* Map Area */}
			<div className="flex-1 flex flex-col relative">
				{/* Search Bar - only show on dashboard */}
				{location.pathname === "/dashboard" && (
					<div className="absolute top-4 left-4 right-4 z-10 max-w-md">
						<PlacesAutocomplete
							apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
							setSelected={onSelectedChanged}
							center={currentLocation}
						/>
					</div>
				)}

				{/* Map */}
				<div className="flex-1">
					<LazyMap
						isLoadingCurrentLocation={isLoadingLocation}
						zoom={ZOOM_LEVELS.DEFAULT}
						center={center}
						markers={markers}
						onMapClick={onMapClick}
						onMarkerClick={onMarkerClick}
						setSelected={setSelected}
					/>
				</div>
			</div>

			{/* Place Drawer */}
			<PlaceDrawer
				place={selected}
				isOpen={isPlaceDrawerOpen}
				onOpenChange={setIsPlaceDrawerOpen}
			/>
		</div>
	);
}
