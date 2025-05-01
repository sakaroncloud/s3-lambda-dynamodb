"use client";
import { getImages } from "@/app/data/dynamo";
import { useQuery } from "@tanstack/react-query";

export const useFetch = () => {
  return useQuery({
    queryKey: ["images"],
    queryFn: async () => await getImages(),
    staleTime: 6000000,
  });
};
