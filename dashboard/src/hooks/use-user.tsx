"use client";
import axios from "axios";

import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/constant";

export const useFetchAllUsers = () => {
  const { isLoading, data, isError } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/user/all`, {
        withCredentials: true,
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
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

export const useGetUserById = (id: string) => {
  const { isLoading, data, isError, error } = useQuery({
    queryKey: ["single-user", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/user/${id}`, {
        withCredentials: true,
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });
      return response.data.data;
    },
  });
  return { singleDataLoading: isLoading, user: data, isError, error };
};
