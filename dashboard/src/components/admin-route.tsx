"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "./shared/Loader";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading, loadToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await loadToken();

        if (!token) {
          router.replace("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/");
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    router.replace("/");
    return null;
  }

  return <>{children}</>;
}
