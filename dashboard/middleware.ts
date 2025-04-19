// middleware.js
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Define protected routes
  const protectedPaths = ["/admin", "/profile", "/settings"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Check if auth cookie exists
  const authCookie = request.cookies.get("accessToken");
  console.log("Auth cookie:", authCookie); // Debugging line
  if (!authCookie) {
    // Redirect to login if no auth cookie
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Note: In this setup, we're only checking if the cookie exists
  // The actual verification happens via the API call to /verify-session
  // For more security, you could make an API call here to verify

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/settings/:path*"],
};
