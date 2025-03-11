"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Search,
  UserPlus,
  Calendar,
  Clock,
  Eye,
} from "lucide-react";
import { BASE_URL } from "@/constant";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { NGODATA, User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { DataTable } from "@/components/shared/DataTable";
import Hint from "@/components/shared/Hint";

// Mock data for demonstration
const mockEmployees = [
  { id: 1, name: "John Doe", designation: "Field Officer", status: "Present" },
  { id: 2, name: "Jane Smith", designation: "Coordinator", status: "Absent" },
  { id: 3, name: "Mike Johnson", designation: "Volunteer", status: "Present" },
  {
    id: 4,
    name: "Sarah Williams",
    designation: "Field Officer",
    status: "Late",
  },
  { id: 5, name: "David Brown", designation: "Manager", status: "Present" },
];

const NGODetailsPage = () => {
  const [ngoDetails, setNgoDetails] = useState<NGODATA>();
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const ngoId = params.id;
  const getNGOSDetails = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/org/${ngoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNgoDetails(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  useEffect(() => {
    getNGOSDetails();
  }, [ngoId]);
  console.log(ngoDetails);
  // Filter employees based on search term

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "Present":
  //       return "bg-green-100 text-green-800";
  //     case "Absent":
  //       return "bg-red-100 text-red-800";
  //     case "Late":
  //       return "bg-yellow-100 text-yellow-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };
  const columns: ColumnDef<User>[] = [
    {
      header: "Image",
      accessorKey: "avatar",
      cell: ({ row }) => {
        return (
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <Image
              alt={row.original.fullName}
              src={`${BASE_URL}/${row.original.avatar}`}
              height={48}
              width={48}
              className="object-cover w-full h-full"
            />
          </div>
        );
      },
    },
    {
      header: "Name",
      accessorKey: "fullName",
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Button variant="link" asChild>
              <Hint label="view" side="top">
                <Link target="_blank" href={`/admin/user/${row.original._id}`}>
                  <Eye size={16} />
                </Link>
              </Hint>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => router.push("/admin")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <h1 className="ml-3 text-2xl font-bold text-gray-900">
              NGO <span className="capitalize">{ngoDetails?.name}</span>{" "}
              Management
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Users size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Total Employees
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {ngoDetails?.users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Calendar size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Today&apos;s Attendance
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {mockEmployees.filter((e) => e.status === "Present").length}/
                  {mockEmployees.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Clock size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Attendance Time
                </h2>
                <p className="text-sm font-semibold text-gray-900">
                  In: {ngoDetails?.morningAttendanceDeadline}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Out: {ngoDetails?.eveningAttendanceStartTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link href={`/admin/register-user?ngo=${ngoId}`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
              <UserPlus size={16} />
              Add New Employee
            </Button>
          </Link>
          <Link href={`/admin/attendance-settings?ngo=${ngoId}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Clock size={16} />
              Configure Attendance Times
            </Button>
          </Link>
        </div>

        {/* Search and Employee List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Employees</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {ngoDetails && (
              <DataTable columns={columns} data={ngoDetails.users} />
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default NGODetailsPage;
