import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);

  const saveToken = async (newToken: string | null) => {
    try {
      if (!newToken) {
        throw new Error("Token cannot be null or undefined");
      }
      await AsyncStorage.setItem("token", newToken);
      setToken(newToken);
    } catch (error) {
      console.log("Error saving token:", error);
      throw error;
    }
  };

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
      return storedToken;
    } catch (error) {
      console.log("Error loading token:", error);
      return null;
    }
  };

  const removeToken = async () => {
    try {
      await AsyncStorage.removeItem("token");
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
