"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Calendar,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Building2 },
  { name: "NGO Management", href: "/admin/ngo", icon: Building2 },
  { name: "User Management", href: "/admin/register-user", icon: Users },
  {
    name: "Attendance Settings",
    href: "/admin/attendance-settings",
    icon: Calendar,
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const SidebarContent = (
    <motion.div
      className="flex h-full flex-col bg-gray-900 relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 shrink-0 items-center px-6">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              key="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-semibold text-white"
            >
              Admin Panel
            </motion.span>
          )}
          {isCollapsed && (
            <motion.div
              key="icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Building2 className="h-6 w-6 text-white mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <nav className="flex flex-1 flex-col px-4 py-4">
        <ul className="flex flex-1 flex-col gap-y-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.li
                key={item.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold transition-colors duration-200",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="transition-opacity duration-200"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </motion.div>
  );

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "hidden md:block transition-all duration-300 ease-in-out transform",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="relative h-full">
          {SidebarContent}
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -right-3 top-20 bg-gray-800 text-white rounded-full p-1 shadow-md hover:bg-gray-700 transition-colors duration-200 ease-in-out z-10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <AnimatePresence mode="wait">
              {isCollapsed ? (
                <motion.div
                  key="expand"
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: 180 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="collapse"
                  initial={{ rotate: 180 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: -180 }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
