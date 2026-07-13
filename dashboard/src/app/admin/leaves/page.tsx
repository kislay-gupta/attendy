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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Search,
  Check,
  X,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  designation: string;
  avatar: string;
}

interface LeaveRequest {
  _id: string;
  user: User;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks?: string;
  createdAt: string;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  // Modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">(
    "APPROVED"
  );
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/leaves`, {
        withCredentials: true,
      });
      if (response.data?.success) {
        setLeaves(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleActionClick = (
    leave: LeaveRequest,
    type: "APPROVED" | "REJECTED"
  ) => {
    setSelectedLeave(leave);
    setActionType(type);
    setRemarks("");
    setIsActionModalOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/leaves/${selectedLeave._id}/status`,
        { status: actionType, remarks },
        { withCredentials: true }
      );

      if (response.data?.success) {
        toast.success(`Leave request ${actionType.toLowerCase()} successfully`);
        setIsActionModalOpen(false);
        fetchLeaves();
      }
    } catch (error: any) {
      console.error("Error updating leave:", error);
      toast.error(
        error.response?.data?.message || "Failed to update leave request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none font-medium">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none font-medium">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none font-medium">
            Pending
          </Badge>
        );
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.user?.designation
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "ALL" || leave.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve leave applications for field agents and staff.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-sm border border-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 uppercase">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {leaves.filter((l) => l.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white shadow-sm border border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 uppercase">
              Approved Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {leaves.filter((l) => l.status === "APPROVED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white shadow-sm border border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 uppercase">
              Rejected Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {leaves.filter((l) => l.status === "REJECTED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-white shadow-sm border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leaves.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg self-start">
              {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab === "ALL"
                      ? "All"
                      : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff, leave type..."
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
          ) : filteredLeaves.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-semibold">
                No leave applications found
              </p>
              <p className="text-sm">
                There are no leave requests matching this filter status.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    Staff Member
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Leave Type
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Duration
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Reason
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Remarks
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => {
                  const days =
                    Math.ceil(
                      Math.abs(
                        new Date(leave.endDate).getTime() -
                          new Date(leave.startDate).getTime()
                      ) /
                        (1000 * 60 * 60 * 24)
                    ) + 1;

                  return (
                    <TableRow
                      key={leave._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm overflow-hidden border border-indigo-200">
                            {leave.user?.avatar ? (
                              <img
                                src={`${BASE_URL}/${leave.user.avatar}`}
                                alt=""
                                className="object-cover h-full w-full"
                              />
                            ) : (
                              leave.user?.fullName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {leave.user?.fullName}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {leave.user?.designation || "Field Agent"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {leave.leaveType}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {days} {days === 1 ? "day" : "days"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <CalendarIcon className="h-3 w-3 shrink-0" />
                          {format(new Date(leave.startDate), "MMM dd")} -{" "}
                          {format(new Date(leave.endDate), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate text-gray-600"
                        title={leave.reason}
                      >
                        {leave.reason}
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-gray-500 italic">
                        {leave.remarks || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {leave.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() =>
                                handleActionClick(leave, "APPROVED")
                              }
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 h-8 font-semibold flex items-center gap-1"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              onClick={() =>
                                handleActionClick(leave, "REJECTED")
                              }
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 font-semibold flex items-center gap-1"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Processed
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "APPROVED" ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="h-5 w-5 bg-green-100 rounded-full p-0.5" />{" "}
                  Approve Leave
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <X className="h-5 w-5 bg-red-100 rounded-full p-0.5" /> Reject
                  Leave
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="text-sm text-gray-600">
              Are you sure you want to {actionType.toLowerCase()} the leave
              request for{" "}
              <strong className="text-gray-900">
                {selectedLeave?.user?.fullName}
              </strong>
              ?
            </div>
            <div className="space-y-2">
              <label
                htmlFor="remarks"
                className="text-sm font-semibold text-gray-700"
              >
                Remarks / Reason (Optional)
              </label>
              <Textarea
                id="remarks"
                placeholder="Enter remarks for the applicant..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsActionModalOpen(false)}
              disabled={submitting}
              className="font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusSubmit}
              disabled={submitting}
              className={
                actionType === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700 text-white font-semibold"
                  : "bg-red-600 hover:bg-red-700 text-white font-semibold"
              }
            >
              {submitting
                ? "Processing..."
                : actionType === "APPROVED"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
