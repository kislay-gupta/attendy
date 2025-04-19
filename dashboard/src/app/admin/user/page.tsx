"use client";
import { DataTable } from "@/components/shared/DataTable";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useFetchAllUsers } from "@/hooks/use-user";
import { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = () => {
  const { userLoader, data, isError } = useFetchAllUsers();
  if (userLoader)
    return (
      <>
        <Loader />
      </>
    );
  if (isError) return <div>Error</div>;
  if (!data) return <div>No data</div>;
  if (data.length === 0) return <div>No users found</div>;
  console.log(data);
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "fullName",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "organization.name",
      header: "NGO",
    },
    {
      accessorKey: "_id",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="btn btn-primary"
              asChild
            >
              <Link href={`/admin/user/${row.original._id}`} target="_blank">
                <Eye size={16} />
              </Link>
            </Button>
            <button className="btn btn-error">Delete</button>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <DataTable columns={columns} data={data.data} />
    </div>
  );
};

export default Page;
