"use server";

import { cookies } from "next/headers";

type AuthResponse = {
  success: boolean;
  message?: string;
};

export async function setAuthCookie(token: string): Promise<AuthResponse> {
  try {
    if (!token) {
      return { success: false, message: "Token is required" };
    }

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to set auth cookie",
    };
  }
}

export async function getAuthCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    return token || null;
  } catch (error) {
    console.error("Error getting auth cookie:", error);
    return null;
  }
}

export async function removeAuthCookie(): Promise<AuthResponse> {
  try {
    (await cookies()).delete("token");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to remove auth cookie",
    };
  }
}
