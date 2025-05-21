import {
	type UseMutationOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CACHE_TIME, URLS, api, queryKeys } from "./api/base";
import type { Place, PlaceLocation } from "./types";

type AddPlaceToListOptions = {
	listIds: string[];
	place: Place;
};

export const useRemoveListItem = (
	options: UseMutationOptions<
		unknown,
		AxiosError,
		{ listId: string; placeId: string },
		{ previousList: any }
	>,
) => {
	const queryClient = useQueryClient();

	return useMutation<
		unknown,
		AxiosError,
		{ listId: string; placeId: string },
		{ previousList: any }
	>({
		mutationKey: ["deleteListItem"],
		mutationFn: ({ listId, placeId }) => {
			return api.delete(`${URLS.lists}/${listId}/items/${placeId}`);
		},
		onMutate: async ({ listId, placeId }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.detail(listId),
			});

			// Snapshot the previous value
			const previousList: any = queryClient.getQueryData(
				queryKeys.lists.detail(listId),
			);

			// Optimistically update to the new value
			if (previousList) {
				queryClient.setQueryData(queryKeys.lists.detail(listId), (old: any) => {
					if (!old || !old.items) return old;
					return {
						...old,
						items: old.items.filter((item: any) => item.id !== placeId),
					};
				});
			}

			// Return context with the snapshot
			return { previousList };
		},
		// If the mutation fails, use the context returned from onMutate to roll back
		onError: (err, { listId }, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(
					queryKeys.lists.detail(listId),
					context.previousList,
				);
			}
		},
		// Always refetch after error or success
		onSettled: (_, __, { listId }) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
		},
		...options,
	});
};

export const useAddPlaceToList = (
	options: UseMutationOptions<unknown, AxiosError, AddPlaceToListOptions>,
) => {
	const queryClient = useQueryClient();

	return useMutation<unknown, AxiosError, AddPlaceToListOptions>({
		mutationKey: ["addPlaceToList"],
		mutationFn: ({ listIds, place }) => {
			return api.post(`${URLS.lists}/place`, {
				listIds,
				place: {
					name: place.name,
					address: place.address,
					latitude: place.latitude,
					longitude: place.longitude,
					imageUrl: place.imageUrl,
					googleMapsId: place.googleMapsId,
					rating: place.rating,
					price_level: place.price_level,
					types: place.types,
					websiteUri: place.websiteUri,
					phoneNumber: place.phoneNumber,
				},
			});
		},
		// Prefetch related data after successful mutation
		onSuccess: (_, { listIds }) => {
			// Invalidate lists and place queries that are affected
			for (const listId of listIds) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.lists.detail(listId),
				});
			}

			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
		},
		...options,
	});
};

export const useGetPlace = (id: string) => {
	return useQuery<Place, AxiosError>({
		queryKey: queryKeys.places.detail(id),
		queryFn: async () =>
			api.get(`${URLS.places}/${id}`).then((res) => res.data),
		staleTime: CACHE_TIME.MEDIUM, // Less frequent updates for place details
		retry: 2, // Retry twice on failure
		// Enable prefetching of place data
		select: (data) => {
			// Process data if needed before returning to components
			return data;
		},
	});
};

export const useGetPlaceLists = ({ placeId }: { placeId: string }) => {
	return useQuery<{ id: string; name: string }[], AxiosError>({
		queryKey: ["placeLists", placeId],
		queryFn: async () => {
			return api.get(`${URLS.places}/${placeId}/lists`).then((res) => res.data);
		},
		staleTime: CACHE_TIME.SHORT, // Shorter stale time for lists as they change more often
	});
};

// Add a prefetching function for places
export const prefetchPlace = async (queryClient: any, id: string) => {
	return queryClient.prefetchQuery({
		queryKey: queryKeys.places.detail(id),
		queryFn: async () =>
			api.get(`${URLS.places}/${id}`).then((res) => res.data),
		staleTime: CACHE_TIME.SHORT,
	});
};

export type TextSearchQuery = {
	query: string;
	latitude: PlaceLocation["latitude"];
	longitude: PlaceLocation["longitude"];
	radius: number;
};

export const getPlace = async ({ googleMapsId }: { googleMapsId: string }) => {
	const response = await api.get<Place>(`/places/${googleMapsId}`);
	return response.data;
};
