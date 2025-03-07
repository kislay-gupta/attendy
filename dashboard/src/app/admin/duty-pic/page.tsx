"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

interface Organization {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  email: string;
  fullName?: string;
  organization?: Organization;
}

interface DutyPhoto {
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
  const [dutyPhotos, setDutyPhotos] = useState<DutyPhoto[]>([]);
  const { isLoading, startLoading, stopLoading } = useLoader();
  const { token } = useAuth();

  const fetchDutyPhotos = async () => {
    try {
      startLoading();
      const response = await axios.get(`${BASE_URL}/api/v1/upload/type/Duty`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update to handle the new response structure
      if (response.data.statusCode && Array.isArray(response.data.data)) {
        setDutyPhotos(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching duty photos:", error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchDutyPhotos();
    const interval = setInterval(fetchDutyPhotos, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Duty Photos</h1>
        </div>

        {isLoading && <Loader />}

        <div className="rounded-md border">
          <Table className="bg-amber-50">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Photo Type</TableHead>
                <TableHead>NGO</TableHead>
                <TableHead>Timestamp</TableHead>

                <TableHead>Location</TableHead>
                <TableHead>Photo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dutyPhotos.map((photo) => (
                <TableRow key={photo._id}>
                  <TableCell>{photo.user.fullName}</TableCell>
                  <TableCell>{photo.photoType}</TableCell>
                  <TableCell>{photo.user.organization.name}</TableCell>

                  <TableCell>
                    {format(new Date(photo.timestamp), "PPpp")}
                  </TableCell>
                  <TableCell>
                    {photo.latitude}, {photo.longitude}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`${BASE_URL}/${photo.img}`, "_blank")
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
