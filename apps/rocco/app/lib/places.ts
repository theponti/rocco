import {
	type UseMutationOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { trpc } from "./trpc/client";
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
	const removeFromListMutation = trpc.items.removeFromList.useMutation();

	return useMutation<
		unknown,
		AxiosError,
		{ listId: string; placeId: string },
		{ previousList: any }
	>({
		mutationKey: ["deleteListItem"],
		mutationFn: ({ listId, placeId }) => {
			return removeFromListMutation.mutateAsync({
				listId,
				itemId: placeId,
			});
		},
		onMutate: async ({ listId, placeId }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: ["lists", listId],
			});

			// Snapshot the previous value
			const previousList: any = queryClient.getQueryData(["lists", listId]);

			// Optimistically update to the new value
			if (previousList) {
				queryClient.setQueryData(["lists", listId], (old: any) => {
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
				queryClient.setQueryData(["lists", listId], context.previousList);
			}
		},
		// Always refetch after error or success
		onSettled: (_, __, { listId }) => {
			queryClient.invalidateQueries({
				queryKey: ["lists", listId],
			});
			queryClient.invalidateQueries({ queryKey: ["lists"] });
		},
		...options,
	});
};

export const useAddPlaceToList = (
	options: UseMutationOptions<unknown, AxiosError, AddPlaceToListOptions>,
) => {
	const queryClient = useQueryClient();
	const createPlaceMutation = trpc.places.create.useMutation();
	const addToListMutation = trpc.items.addToList.useMutation();

	return useMutation<unknown, AxiosError, AddPlaceToListOptions>({
		mutationKey: ["addPlaceToList"],
		mutationFn: async ({ listIds, place }) => {
			// First create the place if it doesn't exist
			const createdPlace = await createPlaceMutation.mutateAsync({
				name: place.name,
				address: place.address || undefined,
				latitude: place.latitude || undefined,
				longitude: place.longitude || undefined,
				imageUrl: place.imageUrl || undefined,
				googleMapsId: place.googleMapsId || undefined,
				rating: place.rating || undefined,
				types: place.types || undefined,
				websiteUri: place.websiteUri || undefined,
				phoneNumber: place.phoneNumber || undefined,
			});

			// Then add the place to all specified lists
			const promises = listIds.map((listId) =>
				addToListMutation.mutateAsync({
					listId,
					itemId: createdPlace.id,
					itemType: "PLACE",
				}),
			);

			await Promise.all(promises);
			return createdPlace;
		},
		// Prefetch related data after successful mutation
		onSuccess: (_, { listIds }) => {
			// Invalidate lists and place queries that are affected
			for (const listId of listIds) {
				queryClient.invalidateQueries({
					queryKey: ["lists", listId],
				});
			}

			queryClient.invalidateQueries({ queryKey: ["lists"] });
		},
		...options,
	});
};

export const useGetPlace = (id: string) => {
	return trpc.places.getById.useQuery(
		{ id },
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 2,
		},
	);
};

export const useGetPlaceLists = ({ placeId }: { placeId: string }) => {
	return trpc.places.getWithLists.useQuery(
		{ id: placeId },
		{
			staleTime: 2 * 60 * 1000, // 2 minutes
			select: (data) => data.lists,
		},
	);
};

// Add a prefetching function for places
export const prefetchPlace = async (queryClient: any, id: string) => {
	return queryClient.prefetchQuery({
		queryKey: ["places", id],
		queryFn: async () => {
			// This would need to be implemented with tRPC client
			// For now, we'll use the hook approach
			return null;
		},
		staleTime: 2 * 60 * 1000,
	});
};

export type TextSearchQuery = {
	query: string;
	latitude: PlaceLocation["latitude"];
	longitude: PlaceLocation["longitude"];
	radius: number;
};

export const getPlace = async ({ googleMapsId }: { googleMapsId: string }) => {
	// This function would need to be updated to use tRPC
	// For now, we'll need to find the place by googleMapsId
	// This might require adding a new tRPC procedure
	throw new Error("getPlace function needs to be updated to use tRPC");
};
