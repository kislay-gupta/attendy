"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Eye, Loader2, Upload } from "lucide-react";
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
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/shared/Loader";
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
import { motion, AnimatePresence } from "framer-motion";
import { handleAxiosError } from "@/utils/handle-error";

interface NGODATA {
  _id: string;
  name: string;
}

// Define form schema using zod
const formSchema = z.object({
  organization: z.string().min(1, "Please select an organization"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  designation: z.string().min(2, "Designation must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RegisterUser = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [ngos, setNgos] = useState<NGODATA[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoader();
  const [loadNgo, setLoadNgo] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: "",
      fullName: "",
      mobileNo: "",
      designation: "",
      email: "",
      password: "",
      avatar: null,
    },
  });

  const steps = [
    { id: 1, name: "Organization" },
    { id: 2, name: "Personal Details" },
    { id: 3, name: "Account" },
  ];

  // Fetch NGO data
  const getNgoData = async () => {
    setLoadNgo(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/org`, {
        withCredentials: true,
      });
      setNgos(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load organizations");
    } finally {
      setLoadNgo(false);
    }
  };

  useEffect(() => {
    getNgoData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("avatar", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    startLoading();
    try {
      const formDataToSend = new FormData();

      Object.entries(values).forEach(([key, value]) => {
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
      setAvatarPreview(null);
      form.reset();
    } catch (error) {
      console.log(error);
      handleAxiosError(error, "An error occurred while registering user");
    } finally {
      stopLoading();
    }
  };

  // Handle validation and step navigation
  const handleStepValidation = async () => {
    if (currentStep === 1) {
      const organizationValid = await form.trigger("organization");
      if (organizationValid) nextStep();
    } else if (currentStep === 2) {
      const fullNameValid = await form.trigger("fullName");
      const designationValid = await form.trigger("designation");
      if (fullNameValid && designationValid) nextStep();
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
            Register New User
          </h1>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{
                        scale: currentStep >= step.id ? 1.1 : 1,
                        backgroundColor:
                          currentStep >= step.id ? "#4F46E5" : "#FFFFFF",
                        borderColor:
                          currentStep >= step.id ? "#4F46E5" : "#D1D5DB",
                      }}
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
                    </motion.div>
                    <span
                      className={`mt-2 text-xs font-medium ${currentStep >= step.id ? "text-indigo-600" : "text-gray-500"}`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ backgroundColor: "#D1D5DB" }}
                      animate={{
                        backgroundColor:
                          currentStep > step.id ? "#4F46E5" : "#D1D5DB",
                      }}
                      className="flex-1 h-1 mx-2"
                    ></motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6   "
                  >
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select NGO</FormLabel>
                          <Select
                            disabled={loadNgo}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an NGO" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ngos.map((ngo) => (
                                <SelectItem key={ngo._id} value={ngo._id}>
                                  {ngo.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="mobileNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email ID</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={isPasswordVisible ? "text" : "password"}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() =>
                                  setIsPasswordVisible(!isPasswordVisible)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between mt-8"
              >
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
                    onClick={handleStepValidation}
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
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Register User"
                    )}
                  </Button>
                )}
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegisterUser;
