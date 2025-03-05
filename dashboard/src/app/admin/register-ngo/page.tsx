"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload } from "lucide-react"; // Add Check import
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BASE_URL } from "@/constant";
import useLoader from "@/hooks/use-loader";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const RegisterNGO = () => {
  const workingDaysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Add steps array after workingDaysOptions
  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Location" },
    { number: 3, title: "Schedule" },
  ];

  interface FormData {
    name: string;
    description: string;
    logo: File | null;
    latitude: string;
    longitude: string;
    address: string;
    workingDays: string[];
    morningAttendanceDeadline: string;
    eveningAttendanceStartTime: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    logo: null,
    latitude: "",
    longitude: "",
    address: "",
    workingDays: [],
    morningAttendanceDeadline: "09:30",
    eveningAttendanceStartTime: "17:00",
  });
  const { startLoading, stopLoading, isLoading } = useLoader();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { token } = useAuth();
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  console.log(formData.workingDays);
  const handleSubmit = async () => {
    startLoading();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      formDataToSend.append("address", formData.address);

      // Update this part - send working days as individual elements
      formData.workingDays.forEach((day, index) => {
        formDataToSend.append(`workingDays[${index}]`, day);
      });

      formDataToSend.append(
        "morningAttendanceDeadline",
        formData.morningAttendanceDeadline
      );
      formDataToSend.append(
        "eveningAttendanceStartTime",
        formData.eveningAttendanceStartTime
      );

      const response = await axios.post(
        `${BASE_URL}/api/v1/org`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      setImagePreview(null);
      toast.success(response.data.message);
      setFormData({
        name: "",
        description: "",
        logo: null,
        latitude: "",
        longitude: "",
        address: "",
        workingDays: [],
        morningAttendanceDeadline: "09:30",
        eveningAttendanceStartTime: "17:00",
      });
      setCurrentStep(0);
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    } finally {
      stopLoading();
    }
  };
  // Add this before the return statement
  const renderStepCounter = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex flex-col items-center relative"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: currentStep >= index ? 1.1 : 1,
                  backgroundColor: currentStep >= index ? "#4F46E5" : "#E5E7EB",
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= index ? "text-white" : "text-gray-500"
                }`}
              >
                {step.number}
              </motion.div>
              <span className="mt-2 text-xs text-gray-500">{step.title}</span>
              {index < steps.length - 1 && (
                <div
                  className={`absolute h-[2px] w-[calc(100%-2.5rem)] left-[2.5rem] top-5 transition-colors duration-300 ${
                    currentStep > index ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Register New NGO
          </h1>

          {renderStepCounter()}

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NGO Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NGO Logo
                  </label>
                  {/* Update the file input section */}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img
                            src={imagePreview}
                            alt="Logo preview"
                            className="mx-auto h-32 w-32 object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="logo-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="logo-upload"
                            name="logo-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Days
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {workingDaysOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.workingDays.includes(day)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              workingDays: checked
                                ? [...prev.workingDays, day]
                                : prev.workingDays.filter((d) => d !== day),
                            }));
                          }}
                        />
                        <label
                          htmlFor={day}
                          className="text-sm font-medium leading-none"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Morning Attendance Deadline
                      </label>
                      <Input
                        type="time"
                        value={formData.morningAttendanceDeadline}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            morningAttendanceDeadline: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evening Attendance Start Time
                      </label>
                      <Input
                        type="time"
                        value={formData.eveningAttendanceStartTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            eveningAttendanceStartTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            {currentStep > 0 && <Button onClick={prevStep}>Previous</Button>}
            {currentStep < 2 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading} type="submit">
                {isLoading ? (
                  <span>
                    <Loader2 className="animate-spin" />
                  </span>
                ) : (
                  <>Submit</>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegisterNGO;
