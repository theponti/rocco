import { createSlice } from "@reduxjs/toolkit";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useAppDispatch } from "./hooks";

const initialState: {
  isOpen: boolean;
  listId?: string;
  onClose: () => void;
  place: google.maps.places.PlaceResult;
} = {
  isOpen: false,
  listId: null,
  place: null,
  onClose: null,
};

export const placesSlice = createSlice({
  name: "places",
  initialState,
  reducers: {
    openPlaceModal(state, action) {
      state.isOpen = true;
      state.place = action.payload.place;
      state.listId = action.payload.listId;
      state.onClose = action.payload.onClose;
    },
    closePlaceModal(state) {
      state.isOpen = false;
      state.place = null;
      state.onClose?.();
      state.onClose = null;
    },
  },
});

export const usePlaceModal = () => {
  const dispatch = useAppDispatch();

  const openPlaceModal = ({
    listId,
    place,
    onClose,
  }: {
    listId?: string;
    place: google.maps.places.PlaceResult;
    onClose?: () => void;
  }) => {
    return dispatch(
      placesSlice.actions.openPlaceModal({ listId, place, onClose }),
    );
  };

  const closePlaceModal = () => {
    return dispatch(placesSlice.actions.closePlaceModal());
  };

  return {
    closePlaceModal,
    openPlaceModal,
  };
};

export function usePlacesService() {
  const placesLibrary = useMapsLibrary("places");
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!placesLibrary) return;

    setPlacesService(
      new placesLibrary.PlacesService(document.createElement("div")),
    );
  }, [placesLibrary]);

  return placesService;
}
