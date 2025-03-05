"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Calendar,
  Clock,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Mock data for demonstration
const mockNGOs = [
  { id: 1, name: "NGO 1", employeeCount: 24, attendance: 85 },
  { id: 2, name: "NGO 2", employeeCount: 18, attendance: 92 },
  { id: 3, name: "NGO 3", employeeCount: 12, attendance: 78 },
  { id: 4, name: "NGO 4", employeeCount: 8, attendance: 88 },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <h1 className="ml-3 text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Building2 size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Total NGOs
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockNGOs.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Users size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Total Employees
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockNGOs.reduce((acc, ngo) => acc + ngo.employeeCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Calendar size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Today&apos;s Attendance
                </h2>
                <p className="text-2xl font-semibold text-gray-900">85%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Clock size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Pending Approvals
                </h2>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link href="/admin/register-user">
            <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
              <UserPlus size={16} />
              Register New User
            </Button>
          </Link>
          <Link href="/admin/register-ngo">
            <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
              <Building2 size={16} />
              Register New NGO
            </Button>
          </Link>
          <Link href="/admin/attendance-settings">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Clock size={16} />
              Configure Attendance Times
            </Button>
          </Link>
        </div>

        {/* NGO List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Managed NGOs</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {mockNGOs.map((ngo) => (
              <li key={ngo.id} className="hover:bg-gray-50">
                <Link href={`/admin/ngo/${ngo.id}`}>
                  <div className="w-full px-6 py-4 flex items-center justify-between text-left">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">
                        {ngo.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {ngo.employeeCount} employees
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
