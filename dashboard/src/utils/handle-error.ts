import { toast } from "sonner";
import axios from "axios";

export const handleAxiosError = (
  error: unknown,
  fallbackMessage: string = "An error occurred"
) => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    toast.error(error.response.data.message);
  } else {
    toast.error(fallbackMessage);
  }
  console.error(error);
};
