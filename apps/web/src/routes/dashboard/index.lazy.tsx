import styled from "@emotion/styled";
import Loading from "@hominem/components/Loading";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import type { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";
import React, { useCallback, useEffect, useState } from "react";

import Lists from "src/components/Lists";
import RoccoMap from "src/components/Map";
import PlacesAutocomplete from "src/components/PlacesAutocomplete";
import { useGetLists } from "src/services/api";
import { mediaQueries } from "src/services/constants/styles";
import { useAuth } from "src/services/hooks";
import { useAppSelector } from "src/services/store";
import type { Place } from "src/services/types";

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

const PlacesAutocompleteWrap = styled.div``;

const DEFAULT_CENTER = { latitude: 37.7749, longitude: -122.4194 }; // Default center (San Francisco)

function Dashboard({ isMapLoaded }: { isMapLoaded: boolean }) {
	const { user } = useAuth();
	const currentLocation = useAppSelector((state) => state.auth.currentLocation);
	const [selected, setSelected] = useState<Place | null>(null);
	const [center, setCenter] = useState(currentLocation || DEFAULT_CENTER);
	const navigate = useNavigate();
	const { data, error, status: listsStatus } = useGetLists();

	const onMapClick = useCallback(
		async (args: MapMouseEvent) => {
			navigate({ to: `/place/${args.detail.placeId}` });
		},
		[navigate],
	);

	const onSelectedChanged = useCallback(
		(place: Place) => {
			navigate({ to: `/place/${place.googleMapsId}` });
		},
		[navigate],
	);

	const onMarkerClick = useCallback(() => {
		navigate({ to: `/place/${selected.googleMapsId}` });
	}, [navigate, selected]);

	useEffect(() => {
		if (currentLocation) {
			setCenter(currentLocation);
		}
	}, [currentLocation]);

	if (!isMapLoaded) {
		return (
			<div className="flex items-center justify-center max-w-[300px] mx-auto min-h-full">
				<Loading size="xl" />
			</div>
		);
	}

	return (
		<Wrap>
			<PlacesAutocompleteWrap>
				<PlacesAutocomplete
					setSelected={onSelectedChanged}
					center={currentLocation}
				/>
			</PlacesAutocompleteWrap>
			<div className="min-h-60 h-60">
				<RoccoMap
					isLoadingCurrentLocation={!currentLocation}
					center={center}
					onMapClick={onMapClick}
					onMarkerClick={onMarkerClick}
					setSelected={setSelected}
				/>
			</div>
			<Lists
				status={listsStatus}
				lists={data}
				error={error}
				currentUserEmail={user?.email}
			/>
		</Wrap>
	);
}

export const Route = createLazyFileRoute("/dashboard/")({
	component: Dashboard,
});
