import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Middleware to protect routes
export default withAuth(
  function middleware(req) {
    // You can add custom logic here
    // For example, role-based access control

    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Example: Protect admin routes
    if (path.startsWith("/admin") && token?.email !== "admin@example.com") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if the user is authenticated
        return !!token;
      },
    },
  },
);

// Specify which routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/api/protected/:path*",
  ],
};
