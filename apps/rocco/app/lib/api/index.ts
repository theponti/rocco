import {
    type QueryKey,
    type UseMutationOptions,
    type UseQueryOptions,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import type { ExtendedList, List, ListInvite, User } from "~/lib/types";

import { api, baseURL } from "./base";

export type CreateListInvite = {
	email: string;
	id: string;
};
export const createListInvite = async ({ email, id }: CreateListInvite) => {
	return api.post(`${baseURL}/lists/${id}/invites`, {
		email,
	});
};

export const useGetInvites = () => {
	return useQuery<ListInvite[]>({
		queryKey: ["invites"],
		queryFn: async () => {
			const res = await api.get(`${baseURL}/invites`);
			return res.data;
		},
	});
};

type OutboundInvitesResponse = (ListInvite & { list: List; user: User })[];
export const useGetOutboundInvites = () => {
	return useQuery<OutboundInvitesResponse>({
		queryKey: ["outboundInvites"],
		queryFn: async () => {
			const res = await api.get(`${baseURL}/invites/outbound`);
			return res.data;
		},
	});
};

export function useAcceptInviteMutation(
	options: UseMutationOptions<unknown, unknown, string> = {},
) {
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.post(`${baseURL}/invites/${id}/accept`);
			return res.data;
		},
		...options,
	});
}

type ListInvitesResponse = (ListInvite & { list: List })[];
export const useGetListInvites = (id: string) => {
	return useQuery<ListInvitesResponse>({
		queryKey: ["listInvites"],
		queryFn: async () => {
			const res = await api.get(`${baseURL}/lists/${id}/invites`);
			return res.data;
		},
	});
};

export const useGetLists = ({
	options,
}: {
	options?: Omit<
		UseQueryOptions<List[], { message: string }, List[], QueryKey>,
		"queryKey" | "queryFn"
	>;
} = {}) => {
	return useQuery<List[], { message: string }>({
		queryKey: ["lists"],
		queryFn: async () => {
			const searchParams = new URLSearchParams();
			searchParams.append("itemType", "PLACE");
			const res = await api.get(`${baseURL}/lists?${searchParams}`);
			return res.data;
		},
		...options,
	});
};

export type GetListResponse = ExtendedList;
export const getList = async (id: string) => {
	const res = await api.get<List>(`${baseURL}/lists/${id}`);
	return res.data;
};

// Hook to get a single list
export const useGetList = (id: string) => {
	return useQuery<List>({
		queryKey: ["list", id],
		queryFn: async () => {
			const res = await api.get<List>(`${baseURL}/lists/${id}`);
			return res.data;
		},
	});
};

export const useCreateList = (
	options?: UseMutationOptions<List, unknown, { name: string }>,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ name }: { name: string }) => {
			const res = await api.post<List>(`${baseURL}/lists`, { name });
			return res.data;
		},
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

	return useMutation({
		mutationFn: async (data: UpdateListData) => {
			const res = await api.put<List>(`${baseURL}/lists/${data.id}`, data);
			return res.data;
		},
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
	options?: UseMutationOptions<unknown, unknown, string>,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.delete(`${baseURL}/lists/${id}`);
			return res.data;
		},
		onSuccess: (_, id) => {
			// Remove the list from the cache
			queryClient.removeQueries({ queryKey: ["list", id] });

			// Update the lists array to remove the deleted list
			queryClient.setQueryData<List[]>(["lists"], (oldLists = []) => {
				return oldLists.filter((list) => list.id !== id);
			});
		},
		...options,
	});
};

export default api;
