import { Recommendation } from "@prisma/client";
import { useMutation, useQuery } from "react-query";

export const useGetBookmarks = () => {
  return useQuery<Recommendation[]>("bookmarks", async () => {
    const res = await fetch("/api/bookmarks");
    return res.json();
  });
};

export const useDeleteBookmark = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
  });
};

export const useCreateBookmark = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch(`/api/bookmarks`, {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      return res.json();
    },
  });
};
