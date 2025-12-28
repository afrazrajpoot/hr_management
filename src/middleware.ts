// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// function redirectToSignIn(req: Request) {
//   return NextResponse.redirect(new URL("/auth/sign-in", req.url));
// }

// export default withAuth((req) => {
//   const token: any = (req as any).nextauth?.token;

//   if (!token) return redirectToSignIn(req);

//   const now = Math.floor(Date.now() / 1000);

//   if (token.exp && token.exp < now) return redirectToSignIn(req);

//   if (token.refreshExpiresAt && token.refreshExpiresAt < now)
//     return redirectToSignIn(req);

//   // Check if email is verified for protected routes
//   // Skip verification check if user just verified (verified=true param)
//   // This handles the case where JWT token hasn't refreshed yet after verification
//   const isJustVerified = req.nextUrl.searchParams.get('verified') === 'true';
//   if (!token.emailVerified && !isJustVerified) {
//     return NextResponse.redirect(new URL("/auth/verify-email", req.url));
//   }

//   // Role-based access control - redirect to appropriate dashboard
//   if (req.nextUrl.pathname.startsWith("/dashboard") && token.role !== "Admin") {
//     // Non-admin trying to access admin dashboard
//     const redirectPath = token.role === "HR" ? "/hr-dashboard" : "/employee-dashboard";
//     return NextResponse.redirect(new URL(redirectPath, req.url));
//   }

//   if (req.nextUrl.pathname.startsWith("/employee-dashboard") && token.role !== "Employee") {
//     // Non-employee trying to access employee dashboard
//     const redirectPath = token.role === "Admin" ? "/dashboard" : "/hr-dashboard";
//     return NextResponse.redirect(new URL(redirectPath, req.url));
//   }

//   if (req.nextUrl.pathname.startsWith("/hr-dashboard") && token.role !== "HR") {
//     // Non-HR trying to access HR dashboard
//     const redirectPath = token.role === "Admin" ? "/dashboard" : "/employee-dashboard";
//     return NextResponse.redirect(new URL(redirectPath, req.url));
//   }

//   return NextResponse.next();
// }, {
//   pages: {
//     signIn: "/auth/sign-in",
//   },
// });

// export const config = {
//   matcher: ["/dashboard/:path*", "/dashboard", "/employee-dashboard/:path*", "/employee-dashboard", "/hr-dashboard/:path*", "/hr-dashboard"],
// };


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log(`[REQ] ${req.method} ${req.nextUrl.pathname}`);

  try {
    // Get token from encrypted JWT cookie
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    const now = Math.floor(Date.now() / 1000);

    // Check token expiration
    if (token.exp && (token.exp as number) < now) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    // Check refresh token expiration
    if (token.refreshExpiresAt && (token.refreshExpiresAt as number) < now) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    // Check email verification
    const isJustVerified = req.nextUrl.searchParams.get('verified') === 'true';
    if (!token.emailVerified && !isJustVerified) {
      return NextResponse.redirect(new URL("/auth/verify-email", req.url));
    }

    // Role-based access control
    const role = token.role as string;

    if (path.startsWith("/dashboard") && role !== "Admin") {
      const redirectPath = role === "HR" ? "/hr-dashboard" : "/employee-dashboard";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    if (path.startsWith("/employee-dashboard") && role !== "Employee") {
      const redirectPath = role === "Admin" ? "/dashboard" : "/hr-dashboard";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    if (path.startsWith("/hr-dashboard") && role !== "HR") {
      const redirectPath = role === "Admin" ? "/dashboard" : "/employee-dashboard";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    return NextResponse.next();

  } catch (error: any) {
    console.error('Middleware error:', error.message);
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }
}

export const config = {
  // Only run middleware on protected dashboard routes
  // This prevents unnecessary middleware execution on public routes
  matcher: ["/dashboard/:path*", "/dashboard", "/employee-dashboard/:path*", "/employee-dashboard", "/hr-dashboard/:path*", "/hr-dashboard"],
};