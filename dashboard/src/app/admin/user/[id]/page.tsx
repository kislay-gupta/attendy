"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from "@/constant";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Mail, Building, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserData {
  _id: string;
  username: string;
  email: string;
  mobileNo: string;
  fullName: string;
  avatar: string;
  designation: string;
  isVerified: boolean;
  role: string;
  organization: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${BASE_URL}/api/v1/user/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(
          axios.isAxiosError(error) && error.response?.status === 404
            ? "User not found"
            : "Failed to load user profile"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id, token]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {user.fullName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
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
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
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
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{user.organization.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1 w-full">
              <Skeleton className="h-8 w-48 md:w-64" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          <div className="space-y-8">
            <div>
              <Skeleton className="h-5 w-40 mb-3" />
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-48" />
                </div>

                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-36" />
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-40 mb-3" />
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-40" />
                </div>

                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-48" />
                </div>

                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-36" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
