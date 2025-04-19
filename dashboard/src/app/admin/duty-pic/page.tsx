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
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoader();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [user, setUser] = useState<User[]>();
  const [selectedUser, setSelectedUser] = useState("");
  const [open, setOpen] = useState(false);
  const getUser = async () => {
    try {
      startLoading();
      const response = await axios.get(`${BASE_URL}/api/v1/user/all`, {
        withCredentials: true,
      });
      // Update to handle the new response structure
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching duty photos:", error);
    } finally {
      stopLoading();
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  console.log(user);
  const fetchDutyPhotos = async () => {
    try {
      const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

      startLoading();
      const response = await axios.get(`${BASE_URL}/api/v1/upload/type`, {
        params: {
          type: "Duty",
          startDate: formattedDate,
          userId: selectedUser,
        },

        withCredentials: true,
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
    if (date && selectedUser) {
      fetchDutyPhotos();
      //   const interval = setInterval(fetchDutyPhotos, 10000); // Refresh every 10 seconds
      //   return () => clearInterval(interval);
    }
  }, [date, selectedUser]);

  return (
    <div className="p-8">
      <div className="w-full ">
        <div className="flex flex-1/2 gap-2">
          <div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    setDate(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="bg-white rounded w-48">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger disabled={isLoading} className="w-full">
                <SelectValue placeholder="Select an Employee" />
              </SelectTrigger>
              <SelectContent>
                {user &&
                  user?.map((ngo) => (
                    <SelectItem key={ngo._id} value={ngo._id}>
                      {ngo.fullName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
                  <TableCell>{photo.user?.organization?.name}</TableCell>
                  <TableCell>
                    {format(new Date(photo.timestamp), "PPpp")}
                  </TableCell>
                  <TableCell>
                    {photo.latitude}, {photo.longitude}
                  </TableCell>
                  <TableCell>
                    {photo.img ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="relative w-12 h-12 cursor-pointer group"
                          onClick={() => setSelectedImage(photo.img)}
                        >
                          <Image
                            src={`${BASE_URL}/${photo.img}`}
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
              {dutyPhotos.map((photo) =>
                photo.img === selectedImage ? (
                  <div key={photo._id}>
                    <p className="text-lg mb-2">{photo.user?.fullName}</p>
                    <p>Organization: {photo.user?.organization?.name}</p>
                    <p>Time: {format(new Date(photo.timestamp), "PPpp")}</p>
                    <p>Type: {photo.photoType}</p>
                    <p>
                      Location: {photo.latitude}, {photo.longitude}
                    </p>
                  </div>
                ) : null
              )}
            </div>
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
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
