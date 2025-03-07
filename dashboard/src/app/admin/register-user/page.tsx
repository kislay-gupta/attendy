"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { BASE_URL } from "@/constant";
import { useAuth } from "@/hooks/use-auth";
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/shared/Loader";
import { toast } from "sonner";
interface NGODATA {
  _id: string;
  name: string;
}
const RegisterUser = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { token } = useAuth();
  const [ngos, setNgos] = useState<NGODATA[]>([]); // Add this line
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organization: "",
    fullName: "",
    mobileNo: "",
    designation: "",
    email: "",
    password: "",
    avatar: null as File | null,
  });
  const { isLoading, startLoading, stopLoading } = useLoader();
  const [loadNgo, setLoadNgo] = useState(false);
  const getNgoData = async () => {
    setLoadNgo(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/org`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNgos(res.data.data); // Update this line
    } catch (error) {
      console.log(error);
    } finally {
      setLoadNgo(false);
    }
  };

  useEffect(() => {
    getNgoData();
  }, []);
  const steps = [
    { id: 1, name: "Organization" },
    { id: 2, name: "Personal Details" },
    { id: 3, name: "Account" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });
      formDataToSend.append("deviceModel", "modal");
      formDataToSend.append("deviceManufacture", "device");
      const response = await axios.post(
        `${BASE_URL}/api/v1/user/register`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      setCurrentStep(1);
      setAvatarPreview("");
      setFormData({
        organization: "",
        fullName: "",
        mobileNo: "",
        designation: "",
        email: "",
        password: "",
        avatar: null as File | null,
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      stopLoading();
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  if (loadNgo) {
    return <Loader />;
  }
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select NGO
              </label>
              <Select
                value={formData.organization}
                onValueChange={(value) =>
                  setFormData({ ...formData, organization: value })
                }
                disabled={loadNgo}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an NGO" />
                </SelectTrigger>
                <SelectContent>
                  {ngos.map((ngo) => (
                    <SelectItem key={ngo._id} value={ngo._id}>
                      {ngo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Upload Avatar
                  </label>
                </div>
              </div>
              <section className="grid grid-cols-1 md:grid-cols-2  gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <Input
                    type="text"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    required
                  />
                </div>
              </section>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <Input
                type="tel"
                value={formData.mobileNo}
                onChange={(e) =>
                  setFormData({ ...formData, mobileNo: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ID
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Register New User
          </h1>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= step.id
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${currentStep >= step.id ? "text-indigo-600" : "text-gray-500"}`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${currentStep > step.id ? "bg-indigo-600" : "bg-gray-300"}`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="px-4"
                >
                  Previous
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                >
                  {isLoading ? (
                    <span>
                      {" "}
                      <Loader2 className="animate-spin" />{" "}
                    </span>
                  ) : (
                    <>Register User</>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
