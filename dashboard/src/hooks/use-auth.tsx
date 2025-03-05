"use client";
import { useState, useEffect } from "react";
import Cookies from "universal-cookie";

export const useAuth = () => {
  const cookies = new Cookies();
  // Initialize state with the token from cookies
  const [token, setToken] = useState<string | null>(
    () => cookies.get("token") || null
  );
  const saveToken = async (newToken: string | null) => {
    try {
      if (!newToken) {
        throw new Error("Token cannot be null or undefined");
      }
      // Set cookie with httpOnly flag, expires in 7 days
      cookies.set("token", newToken, {
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        secure: true,
        sameSite: "strict",
      });
      setToken(newToken);
    } catch (error) {
      console.log("Error saving token:", error);
      throw error;
    }
  };
  const loadToken = async () => {
    try {
      const storedToken = cookies.get("token");
      if (storedToken) {
        setToken(storedToken);
      }
      return storedToken;
    } catch (error) {
      console.log("Error loading token:", error);
      return null;
    }
  };
  const removeToken = async () => {
    try {
      cookies.remove("token", { path: "/" });
      setToken(null);
    } catch (error) {
      console.log("Error removing token:", error);
    }
  };
  // We can remove this useEffect since we're initializing the state with the token
  // useEffect(() => {
  //   loadToken();
  // }, []);
  useEffect(() => {
    console.log("Current token state:", token);
    console.log("Cookie token value:", cookies.get("token"));
  }, [token]);
  return {
    token,
    saveToken,
    loadToken,
    removeToken,
    isAuthenticated: Boolean(token),
  };
};
