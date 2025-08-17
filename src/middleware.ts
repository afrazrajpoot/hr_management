import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function redirectToSignIn(req: Request) {
  return NextResponse.redirect(new URL("/auth/sign-in", req.url));
}

export default withAuth((req) => {
  const token: any = (req as any).nextauth?.token;
 
  if (!token) return redirectToSignIn(req);

  const now = Math.floor(Date.now() / 1000);

  if (token.exp && token.exp < now) return redirectToSignIn(req);

  if (token.refreshExpiresAt && token.refreshExpiresAt < now)
    return redirectToSignIn(req);

  if (req.nextUrl.pathname.startsWith("/dashboard") && token.role !== "Admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (req.nextUrl.pathname.startsWith("/employee-dashboard") && token.role !== "Employee") {
    return NextResponse.redirect(new URL("/employee-dashboard", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/hr-dashboard") && token.role !== "HR") {
    return NextResponse.redirect(new URL("/hr-dashboard", req.url));
  }

  return NextResponse.next();
}, {
  pages: {
    signIn: "/auth/sign-in",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/employee-dashboard/:path*", "/employee-dashboard", "/hr-dashboard/:path*", "/hr-dashboard"],
};
