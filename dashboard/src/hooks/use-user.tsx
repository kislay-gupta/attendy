"use client";
import axios from "axios";

import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/constant";
import { useAuth } from "./use-auth";

export const useFetchAllUsers = () => {
  const { token } = useAuth();
  const { isLoading, data, isError } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
  return {
    userLoader: isLoading,
    data,
    isError,
  };
};
