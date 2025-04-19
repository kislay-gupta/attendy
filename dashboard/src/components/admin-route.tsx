// components/AdminRoute.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "./shared/Loader";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // Direct server verification of the HTTP-only cookie
        const authStatus = await checkAuthStatus();

        if (!authStatus.authenticated) {
          router.replace("/");
        }

        setAuthChecked(true);
      } catch (error) {
        console.error("Auth verification failed:", error);
        router.replace("/");
      }
    };

    if (!isAuthenticated && !isLoading) {
      verifyAccess();
    } else if (isAuthenticated) {
      setAuthChecked(true);
    }
  }, [isAuthenticated, isLoading, checkAuthStatus, router]);

  // Show loader while initial auth check is in progress
  if (isLoading || !authChecked) {
    return <Loader />;
  }

  // If not authenticated after checking, don't render children
  if (!isAuthenticated) {
    return null; // Router redirect is already triggered in useEffect
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}
