import { useUser } from "@clerk/react-router";
import styled from "@emotion/styled";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";
import { href, useLoaderData, useNavigate } from "react-router";

import Lists from "app/components/Lists/lists";
import LazyMap from "app/components/Map/LazyMap";
import PlacesAutocomplete from "app/components/PlacesAutocomplete";
import { useGeolocation } from "app/hooks/useGeolocation";
import { api, baseURL } from "app/lib/api/base";
import { mediaQueries } from "app/lib/styles";
import type { Place, PlaceLocation, UserList } from "app/lib/types";
import { requireAuth } from "app/routes/guards";
import type { Route } from "./+types";

/**
 * Define a default location in case geolocation fails or is loading
 * Default: San Francisco
 */
const DEFAULT_LOCATION: PlaceLocation = {
	latitude: 37.7749,
	longitude: -122.4194,
};

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding-bottom: 32px;

  ${mediaQueries.belowMedium} {
    max-width: calc(100% - 16px);
    margin: 0 auto;
  }
`;

export async function loader(loaderArgs: Route.ClientLoaderArgs) {
	const response = await requireAuth(loaderArgs);

	if ("getToken" in response) {
		const token = await response.getToken();
		try {
			const res = await api.get<UserList[]>(`${baseURL}/lists`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return { lists: res.data };
		} catch (error) {
			throw new Response("Could not load lists.", { status: 500 });
		}
	}
}

const PlacesAutocompleteWrap = styled.div``;

export const ZOOM_LEVELS = {
	DEFAULT: 10,
	SELECTED: 19,
	MARKER: 18,
};

function Dashboard() {
	// Use data fetched by the loader
	const { lists } = useLoaderData() as { lists: UserList[] };
	const { user } = useUser(); // Added: Get user from Clerk
	const { currentLocation, isLoading: isLoadingLocation } = useGeolocation();
	const [selected, setSelected] = useState<Place | null>(null);
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

	const onSelectedChanged = useCallback(
		(place: Place) => {
			navigate(href("/places/:id", { id: place.googleMapsId }));
		},
		[navigate],
	);

	const onMarkerClick = useCallback(() => {
		if (!selected) {
			return;
		}
		navigate(href("/places/:id", { id: selected.googleMapsId }));
	}, [navigate, selected]);

	return (
		<Wrap data-testid="dashboard-scene">
			<PlacesAutocompleteWrap>
				{/* Conditionally render PlacesAutocomplete only when currentLocation is available */}
				{currentLocation ? (
					<PlacesAutocomplete
						setSelected={onSelectedChanged}
						center={currentLocation}
					/>
				) : (
					// Optional: Show a loading state or placeholder while location is loading
					<div>Loading location for search...</div>
				)}
			</PlacesAutocompleteWrap>
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
			{/* Use lists data from loader and pass currentUserEmail */}
			{lists && user?.primaryEmailAddress?.emailAddress ? (
				<Lists
					status={"success"}
					lists={lists}
					error={null}
					currentUserEmail={user.primaryEmailAddress.emailAddress}
				/>
			) : null}
		</Wrap>
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
