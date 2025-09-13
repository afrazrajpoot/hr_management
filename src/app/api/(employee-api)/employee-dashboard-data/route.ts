import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session: any | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add timeout and better error handling for the fetch
    const res = await fetch(
      `http://127.0.0.1:8001/employee_dashboard/dashboard-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId: session.user.id }),
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    // Check if the response is ok
    if (!res.ok) {
      console.error(`FastAPI responded with status: ${res.status}`);
      const errorText = await res.text();
      console.error(`FastAPI error response: ${errorText}`);
      return NextResponse.json(
        { error: `External API error: ${res.status}` },
        { status: 502 } // Bad Gateway
      );
    }

    const data = await res.json();

    // Fetch additional data from database
    const careerRecommendation = await prisma.aiCareerRecommendation.findFirst({
      where: {
        employeeId: session.user.id,
      },
    });

    const assessmentReports = await prisma.individualEmployeeReport.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        data,
        assessmentReports,
      },
      { status: 200 }
    );
  } catch (err: any) {
    // Log the actual error for debugging
    console.error("API route error:", err);

    // Return appropriate status codes
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    // For other errors, return 500 (Internal Server Error), not 401
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
