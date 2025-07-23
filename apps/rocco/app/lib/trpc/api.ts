import {
	type QueryKey,
	type UseMutationOptions,
	type UseQueryOptions,
	useQueryClient,
} from "@tanstack/react-query";
import type { ExtendedList, List, ListInvite } from "~/lib/types";
import { trpc } from "./client";

export function useAcceptInviteMutation(
	options: UseMutationOptions<
		ListInvite,
		unknown,
		{ listId: string; invitedUserEmail: string }
	> = {},
) {
	return;
}

type ListInvitesResponse = (ListInvite & { list: List })[];
export const useGetListInvites = (id: string) => {
	return trpc.invites.getByList.useQuery({ listId: id });
};

export const useGetLists = ({
	options,
}: {
	options?: Omit<
		UseQueryOptions<List[], { message: string }, List[], QueryKey>,
		"queryKey" | "queryFn"
	>;
} = {}) => {
	return trpc.lists.getAll.useQuery();
};

export type GetListResponse = ExtendedList;
export const getList = async (id: string) => {
	// This will be replaced with tRPC query
	return {} as List;
};

// Hook to get a single list
export const useGetList = (id: string) => {
	return trpc.lists.getById.useQuery({ id });
};

export const useCreateList = (
	options?: UseMutationOptions<
		List,
		unknown,
		{ name: string; description: string; isPublic?: boolean }
	>,
) => {
	const queryClient = useQueryClient();

	return trpc.lists.create.useMutation({
		onSuccess: (newList) => {
			// Invalidate lists query to trigger refetch
			queryClient.invalidateQueries({ queryKey: ["lists"] });

			// Optimistic update: Add the new list to the current lists query data
			queryClient.setQueryData<List[]>(["lists"], (oldLists = []) => {
				return [...oldLists, newList];
			});
		},
		...options,
	});
};

export type UpdateListData = {
	id: string;
	name?: string;
	description?: string;
};

export const useUpdateList = (
	options?: UseMutationOptions<List, unknown, UpdateListData>,
) => {
	const queryClient = useQueryClient();

	return trpc.lists.update.useMutation({
		onSuccess: (updatedList) => {
			// Update the specific list in the cache
			queryClient.setQueryData<List>(["list", updatedList.id], updatedList);

			// Update the list in the lists array
			queryClient.setQueryData<List[]>(["lists"], (oldLists = []) => {
				return oldLists.map((list) =>
					list.id === updatedList.id ? updatedList : list,
				);
			});
		},
		...options,
	});
};

export const useDeleteList = (
	options?: UseMutationOptions<{ success: boolean }, unknown, { id: string }>,
) => {
	const queryClient = useQueryClient();

	return trpc.lists.delete.useMutation({
		onSuccess: (_, variables) => {
			// Remove the list from the cache
			queryClient.removeQueries({ queryKey: ["list", variables.id] });

			// Update the lists array to remove the deleted list
			queryClient.setQueryData<List[]>(["lists"], (oldLists = []) => {
				return oldLists.filter((list) => list.id !== variables.id);
			});
		},
		...options,
	});
};
