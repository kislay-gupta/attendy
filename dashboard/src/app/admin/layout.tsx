"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Navbar } from "@/components/admin/Navbar";
import AdminRoute from "@/components/admin-route";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <AdminRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col w-full">
          <Navbar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </AdminRoute>
  );
}
