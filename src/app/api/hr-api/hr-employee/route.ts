import { authOptions } from "@/app/auth"; // Adjust path based on your project structure
import { prisma } from "@/lib/prisma"; // Adjust path based on your project structure
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface CustomSession {
  user?: { id: string };
}

export async function GET() {
  try {
    // 1. Get the authenticated session
    const session: CustomSession | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch employees (users under this HR) with their employee profile
    const employees = await prisma.user.findMany({
      where: { hrId: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        salary: true,
        department: true,
        position: true,
        employeeId: true, // Included for debugging
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            skills: true,
            education: true,
            experience: true
          },
        },
      },
    });

    // 3. Log users with missing employee data for debugging
    employees.forEach((emp: any) => {
      if (!emp.employee) {
        console.warn(`User ${emp.id} (${emp.email}) has no employee record. employeeId: ${emp.employeeId}`);
      }
    });

    // 4. Fetch all reports under this HR
    const reports = await prisma.individualEmployeeReport.findMany({
      where: { hrId: session.user.id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        hrId: true,
        executiveSummary: true,
        departement: true, // Note: Typo in schema (should be `department`)
        geniusFactorProfileJson: true,
        currentRoleAlignmentAnalysisJson: true,
        internalCareerOpportunitiesJson: true,
        retentionAndMobilityStrategiesJson: true,
        developmentActionPlanJson: true,
        personalizedResourcesJson: true,
        dataSourcesAndMethodologyJson: true,
      },
    });

    // 5. Group reports by userId
    const grouped: Record<string, any> = {};
    for (const emp of employees) {
      grouped[emp.id] = { ...emp, reports: [] };
    }
    for (const report of reports) {
      if (grouped[report.userId]) {
        grouped[report.userId].reports.push(report);
      }
    }

    // ✅ Removed filtering, now return all employees (even without reports)
    const result = Object.values(grouped);

    // 6. Return the response
    return NextResponse.json({ employees: result }, { status: 200 });
  } catch (err: any) {
    console.error("Error in GET endpoint:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
