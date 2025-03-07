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
import { Calendar } from "@/components/ui/calendar";

// Update the User interface to match the response
interface Organization {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  organization: Organization;
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
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, startLoading, stopLoading } = useLoader();
  const { token } = useAuth();
  const fetchAttendanceData = async () => {
    try {
      startLoading();
      const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
      const response = await axios.get(
        `${BASE_URL}/api/v1/upload/date-range/?startDate=${formattedDate}`,
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
  }, [date]);

  const filteredData = attendanceData.filter(
    (record) =>
      record.user?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="p-8 grid grid-cols-12 gap-2">
      <div className="w-max col-span-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md bg-white  border"
        />
      </div>

      {isLoading && <Loader />}
      <div className=" col-span-9 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Attendance Records</h1>
          <div className="w-1/3">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table className="bg-amber-50">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Photo Type</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Photo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData &&
                filteredData.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.user.fullName}</TableCell>
                    <TableCell>{record.user.organization.name}</TableCell>
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
    </div>
  );
};

export default Page;
