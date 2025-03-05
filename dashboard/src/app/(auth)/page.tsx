"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/constant";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useLoader from "@/hooks/use-loader";

const Login = () => {
  const [formData, setFormData] = useState({
    mobileNo: "",
    password: "",
  });
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { startLoading, stopLoading, isLoading } = useLoader();
  const { saveToken } = useAuth();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleLogin = async () => {
    startLoading();
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/user/login`,
        formData
      );
      saveToken(response.data.data.accessToken);
      if (response.data.data.user.role === "ADMIN") {
        router.push("/admin");
      }
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading();
    }
    // Add your login logic here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            {/* Replace with your actual logo */}
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="mobileNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mobile No.
              </label>
              <input
                id="mobileNo"
                name="mobileNo"
                type="number"
                pattern="[0-9]*"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your Registered Mobile No."
                value={formData.mobileNo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="button"
              disabled={isLoading}
              onClick={handleLogin}
              className="w-full cursor-pointer flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              {isLoading ? (
                <span className="">
                  <Loader2 className="animate-spin" />
                </span>
              ) : (
                <span>Sign in</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
