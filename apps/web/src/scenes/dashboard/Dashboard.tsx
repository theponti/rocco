import styled from "@emotion/styled";
import { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";
import React, { useCallback, useEffect, useState } from "react";
import Loading from "ui/Loading";

import { mediaQueries } from "src/constants/styles";
import { useAppSelector } from "src/services/hooks";
import { usePlaceModal } from "src/services/store";
import { usePlacesService } from "src/services/google-maps";

import Map from "./components/Map";
import PlacesAutocomplete from "./components/PlacesAutocomplete";

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

const ZOOM_LEVELS = {
  DEFAULT: 10,
  SELECTED: 17,
  MARKER: 18,
};

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // Default center (San Francisco)

function Dashboard({ isMapLoaded }: { isMapLoaded: boolean }) {
  const { openPlaceModal } = usePlaceModal();
  const [zoom, setZoom] = useState(ZOOM_LEVELS.DEFAULT);
  const currentLocation = useAppSelector((state) => state.auth.currentLocation);
  const [selected, setSelected] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [center, setCenter] = useState(currentLocation || DEFAULT_CENTER);
  const placesService = usePlacesService();

  const onMapClick = useCallback(
    async (args: MapMouseEvent) => {
      const { placeId, latLng } = args.detail;
      const place = await new Promise((res) => {
        placesService.getDetails({ placeId }, (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            res(null);
          }
          res(place);
        });
      });

      if (!place || typeof place === "string") {
        return;
      }

      // Select the clicked location
      setSelected(place);
      setCenter(latLng);
      setZoom(ZOOM_LEVELS.MARKER);
      openPlaceModal({
        onClose: () => {
          setSelected(null);
          setZoom(ZOOM_LEVELS.SELECTED);
        },
        place,
      });
    },
    [openPlaceModal, placesService],
  );

  const onSelectedChanged = useCallback(
    (place: google.maps.places.PlaceResult) => {
      const {
        geometry: { location },
      } = place;
      const latLng = { lat: location.lat(), lng: location.lng() };
      setSelected(place);
      setCenter(latLng);
      setZoom(ZOOM_LEVELS.SELECTED);
    },
    [],
  );

  const onMarkerClick = useCallback(() => {
    // The map should zoom slightly when the marker is clicked
    setZoom(ZOOM_LEVELS.MARKER);
    openPlaceModal({
      onClose: () => {
        setSelected(null);
        setZoom(ZOOM_LEVELS.SELECTED);
      },
      place: selected,
    });
  }, [openPlaceModal, selected]);

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
      <Map
        isLoadingCurrentLocation={true}
        zoom={zoom}
        center={center}
        onMapClick={onMapClick}
        onMarkerClick={onMarkerClick}
        selected={selected}
        setSelected={setSelected}
      />
    </Wrap>
  );
}

export default Dashboard;
