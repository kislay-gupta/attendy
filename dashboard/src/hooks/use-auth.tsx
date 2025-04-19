// hooks/use-auth.ts
import { BASE_URL } from "@/constant";
import { useState, useEffect, useCallback } from "react";

interface User {
  userId: string;
  email: string;
  // Add other user properties as needed
}

interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // API URL from environment variable
  const API_URL = BASE_URL || "";

  /**
   * Check authentication status by verifying the accessToken cookie
   */
  const checkAuthStatus = useCallback(async (): Promise<AuthStatus> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/verify-session`, {
        method: "GET",
        credentials: "include", // Important to include cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return { authenticated: false };
      }

      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { authenticated: true, user: data.user };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return { authenticated: false };
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return { authenticated: false };
    }
  }, [API_URL]);

  /**
   * Login user and set HTTP-only cookie
   */
  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, user: data.user };
      } else {
        setIsLoading(false);
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { success: false, message: "Authentication service unavailable" };
    }
  };

  /**
   * Logout user and clear HTTP-only cookie
   */
  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Logout failed" };
      }
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: "Logout service unavailable" };
    }
  };

  // Initial auth check when the hook is first used
  useEffect(() => {
    const initialAuthCheck = async () => {
      await checkAuthStatus();
    };

    initialAuthCheck();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
}
