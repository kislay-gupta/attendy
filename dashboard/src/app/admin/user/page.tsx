"use client";
import { DataTable } from "@/components/shared/DataTable";
import Loader from "@/components/shared/Loader";
import { useFetchAllUsers } from "@/hooks/use-user";
import { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
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
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];
  return (
    <div>
      <DataTable columns={columns} data={data.data} />
    </div>
  );
};

export default Page;
