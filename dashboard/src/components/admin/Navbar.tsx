"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";

interface NavbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Navbar({ isCollapsed, toggleSidebar }: NavbarProps) {
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
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
