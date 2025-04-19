"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Calendar,
  Clock,
  UserPlus,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { BASE_URL } from "@/constant";
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/shared/Loader";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import Hint from "@/components/shared/Hint";
import { toast } from "sonner";
import DeleteModal from "@/components/modals/DeleteModal";

// Mock data for demonstration
interface NGODATA {
  _id: string;
  name: string;
  users: [];
}
const AdminDashboard = () => {
  const [ngoData, setNgoData] = useState<NGODATA[]>([]);
  const { startLoading, stopLoading, isLoading } = useLoader();
  const getNGOS = async () => {
    startLoading();
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/org`, {
        withCredentials: true,
      });
      setNgoData(response.data.data);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      return [];
    } finally {
      stopLoading();
    }
  };
  useEffect(() => {
    getNGOS();
  }, []);
  const deleteNgo = async (id: string) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/org/${id}`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      getNGOS();
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      return [];
    } finally {
      stopLoading();
    }
  };
  const columns: ColumnDef<NGODATA>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Total Employees",
      accessorKey: "users",
      cell: ({ row }) => {
        return <div className="">{row.original.users.length}</div>;
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 items-center">
            <div>
              <Link href={`/admin/ngo/${row.original._id}`}>
                <Hint label="View">
                  <Eye size={16} />
                </Hint>
              </Link>
            </div>
            <div className="my-auto">
              <DeleteModal
                project_name={row.original.name}
                onConfirm={() => {
                  deleteNgo(row.original._id);
                }}
                header="Are You sure?"
              >
                <Button className="my-auto" variant="ghost" size="icon">
                  <Hint label="delete">
                    <Trash2 size={16} />
                  </Hint>
                </Button>
              </DeleteModal>
            </div>
          </div>
        );
      },
    },
  ];
  if (isLoading) {
    return <Loader />;
  }
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
                  {ngoData?.length}
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
                <p className="text-2xl font-semibold text-gray-900">96</p>
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
          <div className="">
            {ngoData && <DataTable columns={columns} data={ngoData} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
