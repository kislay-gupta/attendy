"use client";
import React, { useEffect, useState } from "react";
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
import Image from "next/image";

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
  address: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

const Page = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        {/* Add this state near other state declarations */}

        <div className="rounded-md border">
          <Table className="bg-amber-50">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Photo Type</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Photo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData &&
                filteredData.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.user?.fullName || "N/A"}</TableCell>
                    <TableCell>
                      {record.user?.organization?.name || "N/A"}
                    </TableCell>
                    <TableCell>{record.photoType || "N/A"}</TableCell>
                    <TableCell>
                      {record.timestamp
                        ? format(new Date(record.timestamp), "PPpp")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {record.latitude && record.longitude
                        ? `${record.latitude}, ${record.longitude}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {record.address ? `${record.address}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {record.img ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="relative w-12 h-12 cursor-pointer group"
                            onClick={() => setSelectedImage(record.img)}
                          >
                            <Image
                              src={`${BASE_URL}/${record.img}`}
                              alt="Thumbnail"
                              className="object-cover rounded-md"
                              fill
                            />
                          </div>
                        </div>
                      ) : (
                        "No photo"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Add the lightbox component */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={`${BASE_URL}/${selectedImage}`}
              alt="Preview"
              className="object-contain w-full h-full"
              width={1000}
              height={1000}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 text-sm">
              {attendanceData.map((record) =>
                record.img === selectedImage ? (
                  <div key={record._id}>
                    <p className="text-lg mb-2">{record.user?.fullName}</p>
                    <p>Organization: {record.user?.organization?.name}</p>
                    <p>Time: {format(new Date(record.timestamp), "PPpp")}</p>
                    <p>Type: {record.photoType}</p>
                    <p>
                      Location: {record.latitude}, {record.longitude}
                    </p>
                    <p>
                      Address: {record.address ? `${record.address}` : "N/A"}
                    </p>
                  </div>
                ) : null
              )}
            </div>
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
