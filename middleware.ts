import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/goals") || pathname.startsWith("/analytics")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));

    if (pathname === "/dashboard") {
      const target = token.role === "ADMIN" ? "/dashboard/admin" : token.role === "MANAGER" ? "/dashboard/manager" : "/dashboard/employee";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  if ((pathname === "/login" || pathname === "/signup") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/goals/:path*", "/analytics/:path*", "/login", "/signup"]
};
