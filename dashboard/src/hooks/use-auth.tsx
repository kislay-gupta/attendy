"use client";

import { getAuthCookie } from "@/actions/auth-actions";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";

export const useAuth = () => {
  const cookies = new Cookies();
  const COOKIE_NAME = "accessToken";
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await getAuthCookie();
        setToken(fetchedToken);
      } catch (error) {
        console.error("Error fetching token:", error);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  const saveToken = async (newToken: string | null) => {
    try {
      if (!newToken) {
        throw new Error("Token cannot be null or undefined");
      }

      cookies.set(COOKIE_NAME, newToken, {
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        secure: true,
        sameSite: "strict",
      });
      setToken(newToken);
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  };

  const loadToken = async () => {
    try {
      const storedToken = await getAuthCookie();
      setToken(storedToken);
      if (storedToken) {
        return storedToken;
      }
      return null;
    } catch (error) {
      console.error("Error loading token:", error);
      return null;
    }
  };

  const removeToken = async () => {
    try {
      cookies.remove(COOKIE_NAME, { path: "/" });
      setToken(null);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  };

  const isAuthenticated = Boolean(token);
  console.log({ isAuthenticated, token, isLoading, cookies });
  return {
    token,
    saveToken,
    loadToken,
    removeToken,
    isAuthenticated,
    isLoading,
  };
};
