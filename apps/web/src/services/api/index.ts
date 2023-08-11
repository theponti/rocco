import axios from "axios";
import { Recommendation } from "@prisma/client";
import { useMutation, useQuery } from "react-query";

export const useGetBookmarks = () => {
  return useQuery<Recommendation[]>("bookmarks", async () => {
    const res = await fetch("/api/bookmarks");
    return res.json();
  });
};

export const useDeleteBookmark = () => {
  return useMutation(async (id: string) => {
    const res = await fetch(`/api/bookmarks/${id}`, {
      method: "DELETE",
    });
    return res.json();
  });
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

export default api;
