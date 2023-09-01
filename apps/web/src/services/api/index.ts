import { ListInvite, List, User, UserLists } from "@prisma/client";
import axios from "axios";
import { useMutation, useQuery } from "react-query";

type InboundInvitesResponse = (ListInvite & { list: List; user: User })[];
export const useGetInboundInvites = () => {
  return useQuery<InboundInvitesResponse>("inboundInvites", async () => {
    const res = await fetch("/api/invites/inbound");
    return res.json();
  });
};

type OutboundInvitesResponse = (ListInvite & { list: List; user: User })[];
export const useGetOutboundInvites = () => {
  return useQuery<OutboundInvitesResponse>("outboundInvites", async () => {
    const res = await fetch("/api/invites/outbound");
    return res.json();
  });
};

export function useAcceptInviteMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invites/${id}/accept`, {
        method: "POST",
      });
      return res.json();
    },
  });
}

type ListInvitesResponse = (ListInvite & { list: List })[];
export const useGetListInvites = (id: string) => {
  return useQuery<ListInvitesResponse>("listInvites", async () => {
    const res = await fetch(`/api/list/${id}/invites`);
    return res.json();
  });
};

export const useCreateListInvite = () => {
  return useMutation({
    mutationFn: async ({ email, id }: { email: string; id: string }) => {
      const res = await fetch(`/api/list/${id}/invites`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
  });
};

type UserList = UserLists & { list: List; user: User };
type ListsResponse = UserList[];
export const useGetLists = () => {
  return useQuery<ListsResponse>("lists", async () => {
    const res = await fetch("/api/lists");
    return res.json();
  });
};

export const useCreateList = () => {
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/lists`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
  });
};

export const useGetList = (id: string) => {
  return useQuery<UserList>(["list", id], async () => {
    const res = await fetch(`/api/lists/${id}`);
    return res.json();
  });
};

export const useUpdateList = () => {
  return useMutation({
    mutationFn: async (list: List) => {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PUT",
        body: JSON.stringify(list),
      });
      return res.json();
    },
  });
};

export const useDeleteList = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lists/${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
  });
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

export default api;
