import { useQuery } from "@tanstack/react-query";
import { getAssetById } from "./assets";
import { queryClient } from "../utils/queryClient";

export const fetchAsset = async (id: string | null) =>
  queryClient.fetchQuery({
    queryKey: ["asset", id],
    queryFn: async () => await getAssetById(id),
  });

export const prefetchAsset = (id: string | null) =>
  queryClient.prefetchQuery({
    queryKey: ["asset", id],
    queryFn: async () => await getAssetById(id),
  });

export const useAsset = (id: string | null) => {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: async () => await getAssetById(id),
  });
};
