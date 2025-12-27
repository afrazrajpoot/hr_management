import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import axios from "axios";

// Set max duration for this route (30 seconds)
export const maxDuration = 30;

export async function GET() {
  try {
    const session: any | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch additional data from database in parallel for better performance
    const [careerRecommendation, assessmentReports] = await Promise.all([
      prisma.aiCareerRecommendation.findFirst({
        where: { employeeId: session.user.id },
      }),
      prisma.individualEmployeeReport.findMany({
        where: { userId: session.user.id },
      }),
    ]);

 

    return NextResponse.json({ assessmentReports }, { status: 200 });
  } catch (err: any) {
    console.error("API route error:", err);

    if (axios.isAxiosError(err)) {
      return NextResponse.json(
        {
          error: "External API error",
          details: err.response?.data || err.message,
        },
        { status: err.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
