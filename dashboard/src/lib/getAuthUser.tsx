import { BASE_URL } from "@/constant";
import axios from "axios";

interface User {
  id: string;
  // Add other user properties as needed
}

interface AuthResponse {
  authenticated: boolean;
  user: User;
}

export async function getAuthUser(): Promise<User | null> {
  try {
    const response = await axios.get<AuthResponse>(
      `${BASE_URL}/api/v1/user/verify-session`,
      {
        withCredentials: true,
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return response.data.authenticated ? response.data.user : null;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
