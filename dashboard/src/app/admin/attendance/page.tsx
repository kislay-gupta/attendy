"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BASE_URL } from "@/constant";
import axios from "axios";
import { format } from "date-fns";
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/hooks/use-auth";

interface User {
  _id: string;
  email: string;
  fullName: string;
  organization?: string;
}

interface AttendanceRecord {
  _id: string;
  img: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  photoType: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

const Page = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, startLoading, stopLoading } = useLoader();
  const { token } = useAuth();
  const fetchAttendanceData = async () => {
    try {
      startLoading();
      const response = await axios.get(
        `${BASE_URL}/api/v1/upload/get-all-photo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    const interval = setInterval(fetchAttendanceData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredData = attendanceData.filter((record) =>
    record.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {isLoading && <Loader />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance Records</h1>
        <div className="w-1/3">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Photo Type</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Photo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((record) => (
              <TableRow key={record._id}>
                <TableCell className="font-medium">
                  {record.user.fullName}
                </TableCell>
                <TableCell>{record.user.email}</TableCell>
                <TableCell>{record.photoType}</TableCell>
                <TableCell>
                  {format(new Date(record.timestamp), "PPpp")}
                </TableCell>
                <TableCell>
                  {record.latitude}, {record.longitude}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(`${BASE_URL}/${record.img}`, "_blank")
                    }
                  >
                    View Photo
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
