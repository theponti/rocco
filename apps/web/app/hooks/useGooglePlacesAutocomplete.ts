import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const GOOGLE_PLACES_API_URL =
	"https://maps.googleapis.com/maps/api/place/autocomplete/json";

export interface GooglePlacePrediction {
	description: string;
	place_id: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	};
}

export interface UseGooglePlacesAutocompleteOptions {
	input: string;
	location?: { latitude: number; longitude: number };
	radius?: number;
	apiKey: string;
}

export function useGooglePlacesAutocomplete({
	input,
	location,
	radius = 100,
}: UseGooglePlacesAutocompleteOptions) {
	const fetchPredictions = useCallback(async () => {
		if (!input || input.length < 3) return [];
		const params = new URLSearchParams({
			input,
			key: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
			...(location
				? {
						location: `${location.latitude},${location.longitude}`,
						radius: radius.toString(),
					}
				: {}),
		});
		const response = await fetch(
			`${GOOGLE_PLACES_API_URL}?${params.toString()}`,
		);
		const data = await response.json();
		if (data.status !== "OK") return [];
		return data.predictions as GooglePlacePrediction[];
	}, [input, location, radius]);

	return useQuery<GooglePlacePrediction[], Error>({
		queryKey: ["google-places-autocomplete", input, location, radius],
		queryFn: () => {
			if (!input || input.length < 3) return [];
			return fetchPredictions();
		},
		enabled: !!input && input.length >= 3,
		staleTime: 1000 * 60, // 1 minute
		retry: 1,
	});
}
