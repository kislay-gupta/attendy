"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "@/constant";
import useLoader from "@/hooks/use-loader";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  logo: z.any().optional(),
  workingDays: z.array(z.string()).min(1, "Select at least one working day"),
  morningAttendanceDeadline: z.string(),
  eveningAttendanceStartTime: z.string(),
  privilegeLeave: z.number().min(0, "Must be a positive number"),
  otherLeave: z.number().min(0, "Must be a positive number"),
});

// Derive TypeScript type from the zod schema
type FormValues = z.infer<typeof formSchema>;

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

  // Steps for the multi-step form
  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Location" },
    { number: 3, title: "Schedule" },
    { number: 4, title: "Leaves" },
  ];

  // Initialize the form with shadcn/ui Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      logo: null,
      workingDays: [],
      morningAttendanceDeadline: "09:30",
      eveningAttendanceStartTime: "17:00",
      privilegeLeave: 0,
      otherLeave: 0,
    },
  });

  const { startLoading, stopLoading, isLoading } = useLoader();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Navigation functions
  // Fix the nextStep function
  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    startLoading();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", values.name);
      formDataToSend.append("description", values.description);

      if (values.logo) {
        formDataToSend.append("logo", values.logo);
      }

      // Add working days
      values.workingDays.forEach((day, index) => {
        formDataToSend.append(`workingDays[${index}]`, day);
      });

      formDataToSend.append(
        "morningAttendanceDeadline",
        values.morningAttendanceDeadline
      );
      formDataToSend.append(
        "eveningAttendanceStartTime",
        values.eveningAttendanceStartTime
      );
      formDataToSend.append("privilegeLeave", values.privilegeLeave.toString());
      formDataToSend.append("otherLeave", values.otherLeave.toString());
      const response = await axios.post(
        `${BASE_URL}/api/v1/org`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setImagePreview(null);
      toast.success(response.data.message);
      form.reset();
      setCurrentStep(0);
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      stopLoading();
    }
  };

  // Step progress indicator
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

  // Handle validation and next step navigation
  const handleStepValidation = async () => {
    if (currentStep === 0) {
      const nameValid = await form.trigger("name");
      if (nameValid) nextStep();
    } else if (currentStep === 1) {
      const descriptionValid = await form.trigger("description");
      if (descriptionValid) nextStep();
    } else if (currentStep === 2) {
      const workingDaysValid = await form.trigger("workingDays");
      const morningTimeValid = await form.trigger("morningAttendanceDeadline");
      const eveningTimeValid = await form.trigger("eveningAttendanceStartTime");
      if (workingDaysValid && morningTimeValid && eveningTimeValid) nextStep();
    } else {
      nextStep();
    }
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NGO Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>NGO Logo</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                    <FormField
                      control={form.control}
                      name="workingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Working Days</FormLabel>
                          <div className="grid grid-cols-3 gap-2 mb-6">
                            {workingDaysOptions.map((day) => (
                              <div
                                key={day}
                                className="flex items-center space-x-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, day]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <label
                                  htmlFor={day}
                                  className="text-sm font-medium leading-none"
                                >
                                  {day}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="morningAttendanceDeadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Morning Attendance Deadline</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="morningAttendanceDeadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grace Period Deadline</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eveningAttendanceStartTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Punch Out Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="privilegeLeave"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Privilege Leave</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="otherLeave"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other Leave</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                    onClick={prevStep}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                    onClick={handleStepValidation}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegisterNGO;
