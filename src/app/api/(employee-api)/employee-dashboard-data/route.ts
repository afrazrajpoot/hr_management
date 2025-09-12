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

    const res = await fetch(
      `https://api.geniusfactor.ai/employee_dashboard/dashboard-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId: session.user.id }),
      }
    );

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
    const data = await res.json();

    return NextResponse.json(
      {
        data,
        assessmentReports,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
