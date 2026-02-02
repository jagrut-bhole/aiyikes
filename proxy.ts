import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    const { pathname } = req.nextUrl;

    const authRoutes = ['/', '/login', '/register'];

    const isAuthRoute = authRoutes.includes(pathname) || pathname.startsWith('/login') || pathname.startsWith('/register')

    const protectedRoutes = ['/gallery', '/generate', '/profile', '/ur-remixes'];

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL('/gallery', req.url));
    }

    if (!token && isProtectedRoute) {
      const loginUrl = new URL('/login', req.url);

      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();

  } catch (error) {
    console.log("Proxy {Middleware} Error: ", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/',
    '/gallery/:path*',
    '/generate/:path*',
    '/profile/:path*',
    '/ur-remixes/:path*',
    '/login',
    '/register'
  ]
}