"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BASE_URL } from "@/constant";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/shared/Loader";

interface NGO {
  _id: string;
  name: string;
  morningAttendanceDeadline: string;
  eveningAttendanceStartTime: string;
}

const AttendanceSettings = () => {
  const [selectedNGO, setSelectedNGO] = useState("");
  const [morningDeadline, setMorningDeadline] = useState("09:30");
  const [eveningStartTime, setEveningStartTime] = useState("17:00");
  const [ngoList, setNgoList] = useState<NGO[]>([]);
  const { token } = useAuth();
  const { startLoading, stopLoading, isLoading } = useLoader();
  // Remove searchParams and ngo parameter

  const getNgo = async () => {
    startLoading();
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/org`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNgoList(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    getNgo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/v1/org/${selectedNGO}`,
        {
          morningAttendanceDeadline: morningDeadline,
          eveningAttendanceStartTime: eveningStartTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(
        res.data.message || "Attendance settings updated successfully!"
      );
      setSelectedNGO("");
      setMorningDeadline("");
      setEveningStartTime("");
    } catch (error) {
      console.error(error);
      alert("Failed to update attendance settings");
    } finally {
      stopLoading();
    }
  };
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Clock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configure Attendance Times
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select NGO
              </label>
              <Select value={selectedNGO} onValueChange={setSelectedNGO}>
                <SelectTrigger disabled={isLoading} className="w-full">
                  <SelectValue placeholder="Select an NGO" />
                </SelectTrigger>
                <SelectContent>
                  {ngoList &&
                    ngoList.map((ngo) => (
                      <SelectItem key={ngo._id} value={ngo._id}>
                        {ngo.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Morning Attendance Deadline
                </label>
                <Input
                  type="time"
                  value={morningDeadline}
                  onChange={(e) => setMorningDeadline(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Employees must mark attendance before this time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evening Attendance Start Time
                </label>
                <Input
                  type="time"
                  value={eveningStartTime}
                  onChange={(e) => setEveningStartTime(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Employees cannot mark out before this time
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Attendance Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSettings;
