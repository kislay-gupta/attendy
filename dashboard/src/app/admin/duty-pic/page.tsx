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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [user, setUser] = useState<User[]>();
  const [selectedUser, setSelectedUser] = useState("");
  const [open, setOpen] = useState(false);
  const { token } = useAuth();
  const getUser = async () => {
    try {
      startLoading();
      const response = await axios.get(`${BASE_URL}/api/v1/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
                <SelectValue placeholder="Select an NGO" />
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
