"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmModal } from "../shared/ConfirmModal";
import axios from "axios";
import { BASE_URL } from "@/constant";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useLoader from "@/hooks/use-loader";
import Loader from "../shared/Loader";

interface NavbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Navbar({ isCollapsed, toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { stopLoading, startLoading, isLoading } = useLoader();
  const handleLogOut = async () => {
    startLoading();
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/user/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success(response.data.message || "Logged out successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      stopLoading();
    }
  };
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="h-16 border-b bg-white px-4">
      <div className="flex h-16 items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="transition-all duration-200 ease-in-out"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <span className="text-sm font-medium">Admin</span>
          </div>
          <ConfirmModal
            variant="warning"
            onConfirm={handleLogOut}
            description="Are you sure you want to log out? You will need to sign in again to access the dashboard."
            header="Log Out"
          >
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </ConfirmModal>
        </div>
      </div>
    </div>
  );
}
