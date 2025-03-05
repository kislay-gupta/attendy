'use client';

import { useState, useEffect } from "react";
import { setAuthCookie, getAuthCookie, removeAuthCookie } from "@/actions/auth-actions";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);

  const saveToken = async (newToken: string | null) => {
    try {
      if (!newToken) {
        throw new Error("Token cannot be null or undefined");
      }
      await setAuthCookie(newToken);
      setToken(newToken);
    } catch (error) {
      console.log("Error saving token:", error);
      throw error;
    }
  };

  const loadToken = async () => {
    try {
      const storedToken = await getAuthCookie();
      setToken(storedToken || null);
      return storedToken || null;
    } catch (error) {
      console.log("Error loading token:", error);
      return null;
    }
  };

  const removeToken = async () => {
    try {
      await removeAuthCookie();
      setToken(null);
    } catch (error) {
      console.log("Error removing token:", error);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  return {
    token,
    saveToken,
    loadToken,
    removeToken,
    isAuthenticated: !!token,
  };
};