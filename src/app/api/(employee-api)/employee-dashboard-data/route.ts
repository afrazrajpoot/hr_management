import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const session: any | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("====================================");
    console.log(
      session.user.id,
      "session.user.id",
      `${process.env.NEXT_PUBLIC_API_URL}/employee_dashboard/dashboard-data`
    );
    console.log("====================================");

    // Call FastAPI with axios
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/employee_dashboard/dashboard-data`,
      { employeeId: session.user.id },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("====================================");
    console.log(res.data, "res.data from the request");
    console.log("====================================");

    const data = res.data;

    // Fetch additional data from database
    const careerRecommendation = await prisma.aiCareerRecommendation.findFirst({
      where: { employeeId: session.user.id },
    });

    const assessmentReports = await prisma.individualEmployeeReport.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ data, assessmentReports }, { status: 200 });
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
