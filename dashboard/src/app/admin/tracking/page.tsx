"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "@/constant";
import { toast } from "sonner";
import Loader from "@/components/shared/Loader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Map,
  MapPin,
  Navigation,
  Calendar as CalendarIcon,
  Battery,
  Play,
  RotateCcw,
  User as UserIcon,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
}

interface LocationLog {
  latitude: number;
  longitude: number;
  batteryLevel?: number;
  timestamp: string;
}

export default function TrackingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const mapRef = useRef<any>(null);
  const mapContainerId = "tracking-leaflet-map";
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const playbackTimerRef = useRef<any>(null);

  // Load Leaflet dynamically
  const loadLeaflet = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).L) {
        resolve((window as any).L);
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve((window as any).L);
      document.body.appendChild(script);
    });
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/user/all`, {
        withCredentials: true,
      });
      if (response.data?.success) {
        setUsers(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedUserId(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load agents list");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchHistory = async () => {
    if (!selectedUserId || !selectedDate) return;
    setLoadingHistory(true);
    // Reset playback
    setIsPlaying(false);
    setPlaybackIndex(-1);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/location-logs/history?userId=${selectedUserId}&date=${selectedDate}`,
        { withCredentials: true }
      );
      if (response.data?.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch location history:", error);
      toast.error("Failed to load location logs");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedUserId, selectedDate]);

  // Map initialization and updates
  useEffect(() => {
    if (logs.length === 0) return;

    loadLeaflet().then((L) => {
      // Initialize map if not already done
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerId).setView(
          [logs[0].latitude, logs[0].longitude],
          15
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapRef.current);
      }

      // Clear existing markers/lines
      if (markerRef.current) mapRef.current.removeLayer(markerRef.current);
      if (polylineRef.current) mapRef.current.removeLayer(polylineRef.current);

      const latlngs = logs.map((log) => [log.latitude, log.longitude]);

      // Create route line
      polylineRef.current = L.polyline(latlngs, {
        color: "#4f46e5",
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current);

      // Create marker for the last known position
      const lastLog = logs[logs.length - 1];
      markerRef.current = L.marker([lastLog.latitude, lastLog.longitude], {
        icon: L.divIcon({
          className: "custom-div-icon",
          html: `<div class="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white animate-pulse shadow-md"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(mapRef.current);

      // Fit map bounds to the route
      mapRef.current.fitBounds(polylineRef.current.getBounds(), {
        padding: [50, 50],
      });
    });

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [logs]);

  // Route playback simulation
  const handlePlayback = () => {
    if (logs.length === 0) return;

    loadLeaflet().then((L) => {
      if (isPlaying) {
        clearInterval(playbackTimerRef.current);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        let currentIndex =
          playbackIndex === -1 || playbackIndex === logs.length - 1
            ? 0
            : playbackIndex;
        setPlaybackIndex(currentIndex);

        playbackTimerRef.current = setInterval(() => {
          setPlaybackIndex((prev) => {
            const nextIndex = prev + 1;
            if (nextIndex >= logs.length) {
              clearInterval(playbackTimerRef.current);
              setIsPlaying(false);
              toast.success("Route playback completed");
              return prev;
            }

            // Update marker position on map
            const currentLog = logs[nextIndex];
            if (markerRef.current) {
              markerRef.current.setLatLng([
                currentLog.latitude,
                currentLog.longitude,
              ]);
              mapRef.current.panTo([currentLog.latitude, currentLog.longitude]);
            }
            return nextIndex;
          });
        }, 800);
      }
    });
  };

  const handleResetPlayback = () => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setIsPlaying(false);
    setPlaybackIndex(-1);
    if (logs.length > 0 && markerRef.current) {
      const lastLog = logs[logs.length - 1];
      markerRef.current.setLatLng([lastLog.latitude, lastLog.longitude]);
      if (polylineRef.current) {
        mapRef.current.fitBounds(polylineRef.current.getBounds(), {
          padding: [50, 50],
        });
      }
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Live Geolocation Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor field worker routes, live location updates, and verify duty
          coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Card */}
        <Card className="lg:col-span-1 shadow-sm border border-gray-150 h-fit bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-600" /> Filter agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Select Field Agent
              </label>
              {loadingUsers ? (
                <div className="text-xs text-gray-500">Loading agents...</div>
              ) : (
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {users.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Select Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
            </div>

            {logs.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h4 className="text-sm font-bold text-gray-800">
                  Playback controls:
                </h4>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayback}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1.5"
                    size="sm"
                  >
                    <Play className="h-4 w-4" />{" "}
                    {isPlaying
                      ? "Pause"
                      : playbackIndex > -1
                        ? "Resume"
                        : "Play Route"}
                  </Button>
                  <Button
                    onClick={handleResetPlayback}
                    variant="outline"
                    size="sm"
                    className="border-gray-200"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                {playbackIndex > -1 && (
                  <div className="text-xs text-indigo-600 font-semibold bg-indigo-50 p-2 rounded border border-indigo-100 flex items-center justify-between">
                    <span>
                      Point: {playbackIndex + 1} / {logs.length}
                    </span>
                    <span>
                      Time:{" "}
                      {format(
                        new Date(logs[playbackIndex].timestamp),
                        "hh:mm a"
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map & Timeline Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Map Viewer */}
          <Card className="md:col-span-2 shadow-sm border border-gray-150 bg-white">
            <CardContent className="p-0 relative h-[550px] rounded-lg overflow-hidden">
              {loadingHistory ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-10">
                  <Loader />
                </div>
              ) : logs.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gray-50 text-gray-500">
                  <Map className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="font-semibold text-lg">
                    No tracking logs found
                  </p>
                  <p className="text-sm max-w-xs">
                    No geolocations logged for the selected date. Check if
                    tracking is enabled on the agent's device.
                  </p>
                </div>
              ) : null}
              {/* Actual Map Target */}
              <div
                id={mapContainerId}
                className="h-full w-full bg-gray-100"
              ></div>
            </CardContent>
          </Card>

          {/* Timeline Logs */}
          <Card className="md:col-span-1 shadow-sm border border-gray-150 bg-white flex flex-col h-[550px]">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-md font-bold">
                Route Log Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  Select agent and date to load breadcrumbs.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {logs.map((log, index) => {
                    const isActive = index === playbackIndex;
                    return (
                      <div
                        key={index}
                        className={`p-3 text-xs transition-colors flex flex-col gap-1 cursor-pointer hover:bg-gray-50/50 ${
                          isActive
                            ? "bg-indigo-50/80 border-l-2 border-indigo-600"
                            : ""
                        }`}
                        onClick={() => {
                          setPlaybackIndex(index);
                          if (markerRef.current) {
                            markerRef.current.setLatLng([
                              log.latitude,
                              log.longitude,
                            ]);
                            mapRef.current.panTo([log.latitude, log.longitude]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-gray-800">
                            {format(new Date(log.timestamp), "hh:mm:ss a")}
                          </span>
                          {log.batteryLevel && (
                            <span className="text-gray-500 flex items-center gap-0.5">
                              <Battery className="h-3.5 w-3.5 text-green-500" />{" "}
                              {log.batteryLevel}%
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 flex items-center gap-1 font-mono">
                          <MapPin className="h-3 w-3 text-gray-400" />{" "}
                          {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
