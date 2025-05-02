// components/AttendanceCalendar.tsx
"use client";
import { BASE_URL } from "@/constant";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles

interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
}

interface AttendanceCalendarProps {
  id: string;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ id }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [data, setData] = useState<AttendanceRecord[]>([]);
  // Convert attendance array to map for fast lookup
  const getAttendanceData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/v1/attendance?userId=${id}`,
        {
          withCredentials: true,
        }
      );
      const data = res.data.data;
      setData(data);
      console.log(data, "data");
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };
  const attendanceMap = new Map(
    data.map((record) => [new Date(record.date).toDateString(), record.status])
  );

  useEffect(() => {
    getAttendanceData();
  }, [id]);

  const tileContent = ({ date }: { date: Date }) => {
    const status = attendanceMap.get(date.toDateString());
    if (status) {
      return (
        <div
          className={`w-3 h-3 rounded-full mx-auto mt-1 ${
            status === "present" ? "bg-green-500" : "bg-red-500"
          }`}
          title={status}
        />
      );
    }
    return null;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance Calendar</h2>
      <Calendar onClickDay={setSelectedDate} tileContent={tileContent} />
      {selectedDate && (
        <p className="mt-4 text-md">
          Selected Date: <strong>{selectedDate.toDateString()}</strong> -{" "}
          {attendanceMap.get(selectedDate.toDateString()) || "No Record"}
        </p>
      )}
    </div>
  );
};

export default AttendanceCalendar;
