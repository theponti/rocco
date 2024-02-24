import { useMutation } from "react-query";
import api from ".";
import { Place } from "../types";

export const useAddPlaceToList = (options) => {
  return useMutation(
    ({ listIds, place }: { listIds: string[]; place: Place }) => {
      return api.post(`/lists/place`, {
        listIds,
        place: {
          name: place.name,
          address: place.address,
          location: {
            lat: place.latitude,
            lng: place.longitude,
          },
          imageUrl: place.imageUrl,
          place_id: place.place_id,
          rating: place.rating,
          price_level: place.price_level,
          types: place.types,
          website: place.website,
          international_phone_number: place.international_phone_number,
        },
      });
    },
    options,
  );
};
