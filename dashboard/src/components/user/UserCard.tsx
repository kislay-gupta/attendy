"use client";
import { BASE_URL } from "@/constant";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { Mail, User, Building, AlertCircle } from "lucide-react";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { useGetUserById } from "@/hooks/use-user";
import { ProfileSkeleton } from "../skeletons/ProfileSkeleton";

const UserCard = ({ id }: { id: string }) => {
  const { isError, user, singleDataLoading, error } = useGetUserById(id);

  console.log(error, "error");
  if (singleDataLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was error while retrieving the data{" "}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The requested user profile could not be found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Card className="max-w-3xl mx-auto ">
        {user && (
          <>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  <AvatarImage
                    src={`${BASE_URL}/${user.avatar}`}
                    alt={user.fullName}
                  />
                  <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                    {user.fullName}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center md:text-left space-y-2 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <CardTitle className="text-2xl md:text-3xl">
                      {user.fullName}
                    </CardTitle>
                    {user.isVerified && (
                      <Badge
                        variant="outline"
                        className="ml-0 md:ml-2  self-center"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground text-lg">
                    {user.designation}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-base font-medium flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4" /> Contact Information
                  </h3>
                  <Separator className="mb-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Email Address
                      </p>
                      <p className="font-medium">{user.email}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Mobile Number
                      </p>
                      <p className="font-medium">
                        {user.mobileNo || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" /> Account Details
                  </h3>
                  <Separator className="mb-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">@{user.username}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Organization
                      </p>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {user?.organization?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default UserCard;
