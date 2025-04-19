"use client";

import { useAuth } from "@/hooks/use-auth";
// import { redirect } from "next/navigation";
import { useEffect } from "react";
import Loader from "./shared/Loader";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading, loadToken } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      const res = await loadToken(); // Load the token when the component mounts
      console.log(res, "res from admin route");

      if (!isLoading && !isAuthenticated) {
        // redirect("/");
        console.log("Not authenticated, redirecting to login page");
      }
    };

    fetchToken();
  }, [isAuthenticated, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  // Only render children when authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
