import { authOptions } from "@/app/auth"; // Adjust path based on your project structure
import { prisma } from "@/lib/prisma"; // Adjust path based on your project structure
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface CustomSession {
  user?: { id: string };
}

export async function GET(request: Request) {
  try {
    // 1. Get the authenticated session
    const session: CustomSession | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters for pagination and filters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const searchTerm = url.searchParams.get("search") || "";
    const department = url.searchParams.get("department") || "";
    const risk = url.searchParams.get("risk") || "";
    const status = url.searchParams.get("status") || "";

    // Build where clause for filters
    const whereClause: any = { hrId: session.user.id };
    if (searchTerm) {
      whereClause.OR = [
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { position: { hasSome: [searchTerm] } },
      ];
    }
    if (department && department !== "All Departments") {
      whereClause.department = { hasSome: [department] };
    }

    // 2. Fetch total count of employees with filters
    const totalEmployees = await prisma.user.count({
      where: whereClause,
    });

    // 3. Fetch paginated employees with filters
    const employees = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        salary: true,
        department: true,
        position: true,
        employeeId: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            skills: true,
            education: true,
            experience: true,
          },
        },
      },
    });

    // 4. Log users with missing employee data for debugging
    employees.forEach((emp: any) => {
      if (!emp.employee) {
        console.warn(
          `User ${emp.id} (${emp.email}) has no employee record. employeeId: ${emp.employeeId}`
        );
      }
    });

    // 5. Fetch all reports under this HR (for now, fetch all; optimize later if needed)
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
        risk_analysis: true,
      },
    });

    // 6. Group reports by userId
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

    // 7. Calculate total pages
    const totalPages = Math.ceil(totalEmployees / limit);

    // 8. Return the response with pagination info
    return NextResponse.json(
      {
        employees: result,
        pagination: {
          currentPage: page,
          totalPages,
          totalEmployees,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in GET endpoint:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
