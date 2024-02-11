import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "react-query";

import { User } from "../auth";
import { List, ListInvite, UserList } from "../types";
import { api, baseURL } from "./base";
import { AxiosError } from "axios";
import { usePlacesService } from "../google-maps";
import { getDefaultImageUrl } from "./places";

export const useGetInvites = () => {
  return useQuery<ListInvite[]>("invites", async () => {
    const res = await api.get(`${baseURL}/invites`);
    return res.data;
  });
};

type OutboundInvitesResponse = (ListInvite & { list: List; user: User })[];
export const useGetOutboundInvites = () => {
  return useQuery<OutboundInvitesResponse>("outboundInvites", async () => {
    const res = await api.get(`${baseURL}/invites/outbound`);
    return res.data;
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
  return useQuery<ListInvitesResponse>("listInvites", async () => {
    const res = await api.get(`${baseURL}/lists/${id}/invites`);
    return res.data;
  });
};

export const useCreateListInvite = ({
  onSuccess,
  onError,
}: {
  onSuccess: (data: ListInvite) => void;
  onError?: (err: AxiosError) => void;
}) => {
  return useMutation({
    mutationFn: async ({ email, id }: { email: string; id: string }) => {
      const res = await api.post(`${baseURL}/lists/${id}/invites`, {
        email,
      });
      return res.data;
    },
    onError,
    onSuccess,
  });
};

export const useGetLists = ({
  options,
}: {
  options?: Omit<
    UseQueryOptions<UserList[], { message: string }, UserList[], QueryKey>,
    "queryKey" | "queryFn"
  >;
} = {}) => {
  return useQuery<UserList[], { message: string }>(
    "lists",
    async () => {
      const res = await api.get(`${baseURL}/lists`);
      return res.data;
    },
    options,
  );
};

export type ListPlace = {
  id: string;
  imageUrl: string;
  itemId: string;
  name: string;
  googleMapsId: string;
  types: string[];
  description: string;
};

type GetListResponse = UserList & {
  id: string;
  items: ListPlace[];
};
export const useGetList = (id: string) => {
  const placesService = usePlacesService();

  return useQuery<GetListResponse>(
    ["list", id],
    async () => {
      const res = await api.get<GetListResponse>(`${baseURL}/lists/${id}`);
      const list = res.data;
      const items = await Promise.all(
        res.data.items.map(async (item) => {
          let imageUrl = item.imageUrl;

          if (!imageUrl) {
            imageUrl = await new Promise<string>((resolve) => {
              placesService.getDetails(
                { placeId: item.googleMapsId },
                (place) => {
                  if (place) {
                    const image = getDefaultImageUrl(place);
                    resolve(image);
                  }
                },
              );
            });
          }

          console.log("NO IMAGE URL", item);
          return {
            ...item,
            imageUrl,
          };
        }),
      );

      return {
        ...list,
        items,
      };
    },
    {
      retry: false,
    },
  );
};

export const useUpdateList = () => {
  return useMutation({
    mutationFn: async (list: List) => {
      const res = await api.put(`${baseURL}/lists/${list.id}`, {
        list,
      });
      return res.data;
    },
  });
};

export const useDeleteList = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`${baseURL}/lists/${id}`);
      return res.data;
    },
  });
};

export default api;
