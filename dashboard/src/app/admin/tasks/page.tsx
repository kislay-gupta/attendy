"use client";

import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar as CalendarIcon,
  MapPin,
  Eye,
  Trash2,
  Camera,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  assignedTo: User;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  dueDate?: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  checkInTime?: string;
  checkOutTime?: string;
  checkInPhoto?: string;
  checkOutPhoto?: string;
  completionNotes?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create Task dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  // View Task details dialog states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/tasks`, { withCredentials: true }),
        axios.get(`${BASE_URL}/api/v1/user/all`, { withCredentials: true }),
      ]);
      if (tasksRes.data?.success) {
        setTasks(tasksRes.data.data);
      }
      if (usersRes.data?.success) {
        // Response format is { success: true, data: [...] }
        setUsers(usersRes.data.data);
      }
    } catch (error) {
      console.error("Failed to load tasks/users:", error);
      toast.error("Failed to load task board data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo || !lat || !lng || !address) {
      toast.error("All required fields must be filled");
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/tasks`,
        {
          title,
          description,
          assignedTo,
          locationLatitude: Number(lat),
          locationLongitude: Number(lng),
          address,
          dueDate: dueDate || undefined,
        },
        { withCredentials: true }
      );

      if (response.data?.success) {
        toast.success("Task created and assigned successfully");
        setIsCreateOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setAssignedTo("");
        setLat("");
        setLng("");
        setAddress("");
        setDueDate("");
        fetchData();
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/tasks/${id}`, {
        withCredentials: true,
      });
      if (response.data?.success) {
        toast.success("Task deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleViewClick = (task: Task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 border-none font-semibold">
            Completed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-none font-semibold">
            In Progress
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-800 border-none font-semibold">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-none font-semibold">
            Assigned
          </Badge>
        );
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo?.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      task.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Task & Visit Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign site visits, customer meetings, or inspect jobs for your
            field agents.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 self-start md:self-auto shadow"
        >
          <Plus className="h-4 w-4" /> Assign New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border border-gray-150">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-gray-500">
              Assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter((t) => t.status === "ASSIGNED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border border-gray-150">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-gray-500">
              In Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter((t) => t.status === "IN_PROGRESS").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border border-gray-150">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-gray-500">
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter((t) => t.status === "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border border-gray-150">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-gray-500">
              Total Assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {tasks.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg self-start">
              {["ALL", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                    statusFilter === status
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {status === "ALL"
                    ? "All Tasks"
                    : status.replace("_", " ").charAt(0) +
                      status.replace("_", " ").slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search title, agent, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <Loader />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-semibold">No tasks found</p>
              <p className="text-sm">There are no tasks matching your query.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    Task Title
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Assigned Agent
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Target Address
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Due Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-semibold text-gray-900">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      {task.assignedTo?.fullName || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                        <span
                          className="truncate max-w-[250px]"
                          title={task.address}
                        >
                          {task.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="text-sm flex items-center gap-1 text-gray-600">
                          <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                          {format(new Date(task.dueDate), "MMM dd, yyyy")}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No due date
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewClick(task)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(task._id)}
                          title="Delete Task"
                          className="hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Assign New Field Task</DialogTitle>
            <DialogDescription>
              Fill out the task details and assign it to a field agent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Task Title *
              </label>
              <Input
                placeholder="e.g. Inspect site coordinates, Customer meeting"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <Textarea
                placeholder="Provide detailed instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Assign To Agent *
                </label>
                <Select
                  onValueChange={setAssignedTo}
                  value={assignedTo}
                  required
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {users.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Target Address *
              </label>
              <Input
                placeholder="e.g. 123 Sector 4, New Delhi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Latitude *
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 28.6139"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Longitude *
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 77.2090"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {creating ? "Assigning..." : "Assign Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{selectedTask?.title}</span>
              {selectedTask && getStatusBadge(selectedTask.status)}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Assigned to {selectedTask?.assignedTo?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedTask?.description && (
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-800">
                  Instructions:
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {selectedTask.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-500 block">Target Location:</span>
                <span className="font-semibold text-gray-800">
                  {selectedTask?.address}
                </span>
                <span className="text-xs text-gray-500 block">
                  ({selectedTask?.location.latitude},{" "}
                  {selectedTask?.location.longitude})
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 block">Due Date:</span>
                <span className="font-semibold text-gray-800">
                  {selectedTask?.dueDate
                    ? format(new Date(selectedTask.dueDate), "PPP")
                    : "No due date"}
                </span>
              </div>
            </div>

            {selectedTask?.status === "COMPLETED" && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-sm font-bold text-gray-850 flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-green-600" />{" "}
                  Completion Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">
                      Started / Checked In:
                    </span>
                    <span className="font-semibold text-gray-800">
                      {selectedTask.checkInTime
                        ? format(new Date(selectedTask.checkInTime), "PPpp")
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">
                      Completed / Checked Out:
                    </span>
                    <span className="font-semibold text-gray-800">
                      {selectedTask.checkOutTime
                        ? format(new Date(selectedTask.checkOutTime), "PPpp")
                        : "-"}
                    </span>
                  </div>
                </div>

                {selectedTask.completionNotes && (
                  <div className="space-y-1">
                    <span className="text-gray-500 text-sm block">
                      Agent Notes:
                    </span>
                    <p className="text-sm text-gray-600 bg-green-50/50 p-3 rounded-lg border border-green-100 italic">
                      "{selectedTask.completionNotes}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {selectedTask.checkInPhoto && (
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Camera className="h-3 w-3" /> Check-in Photo
                      </span>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={`${BASE_URL}/${selectedTask.checkInPhoto}`}
                          alt="Check In"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                  {selectedTask.checkOutPhoto && (
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Camera className="h-3 w-3" /> Completion Photo
                      </span>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={`${BASE_URL}/${selectedTask.checkOutPhoto}`}
                          alt="Completion"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewOpen(false)}
              className="font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
