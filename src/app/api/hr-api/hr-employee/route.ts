import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface CustomSession {
  user?: { id: string };
}

export async function GET(request: Request) {
  try {
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

    // Build where clause for users (same as original)
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

    // 1. Fetch all users with basic filters (we'll filter further for status/risk)
    const allUsers = await prisma.user.findMany({
      where: whereClause,
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

    // 2. Get all user IDs from allUsers
    const allUserIds = allUsers.map(user => user.id);

    // 3. Fetch all reports under this HR
    let reports = await prisma.individualEmployeeReport.findMany({
      where: { 
        hrId: session.user.id,
        userId: { in: allUserIds } // Only get reports for users we're considering
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        hrId: true,
        executiveSummary: true,
        departement: true,
        geniusFactorProfileJson: true,
        geniusFactorScore: true,
        currentRoleAlignmentAnalysisJson: true,
        internalCareerOpportunitiesJson: true,
        retentionAndMobilityStrategiesJson: true,
        developmentActionPlanJson: true,
        personalizedResourcesJson: true,
        dataSourcesAndMethodologyJson: true,
        risk_analysis: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 4. Apply risk filter to reports if specified
    if (risk && risk !== "All Risk Levels") {
      reports = reports.filter((report: any) => {
        const riskLevel = report.currentRoleAlignmentAnalysisJson?.retention_risk_level;
        return riskLevel === risk;
      });
    }

    // Get user IDs that have reports
    const usersWithReportsIds = [...new Set(reports.map((report: any) => report.userId))];

    // 5. Group reports by userId (same as original)
    const grouped: Record<string, any> = {};
    for (const emp of allUsers) {
      grouped[emp.id] = { ...emp, reports: [] };
    }
    
    for (const report of reports) {
      if (grouped[report.userId]) {
        grouped[report.userId].reports.push(report);
      }
    }

    let allEmployeesData = Object.values(grouped);

    // 6. Apply status filter for metrics calculation (use full dataset)
    let filteredEmployeesForMetrics = allEmployeesData;

    if (status === "Completed") {
      filteredEmployeesForMetrics = filteredEmployeesForMetrics.filter((employee: any) => employee.reports.length > 0);
    } else if (status === "Not Started") {
      filteredEmployeesForMetrics = filteredEmployeesForMetrics.filter((employee: any) => employee.reports.length === 0);
    }
    // If no status or "all", keep ALL employees for metrics

    // Calculate metrics using full filtered dataset (not paginated)
    const totalAssessments = filteredEmployeesForMetrics.reduce(
      (sum: number, emp: any) => sum + emp.reports.length,
      0
    );
    const totalCompletedEmployees = filteredEmployeesForMetrics.filter(
      (emp: any) => emp.reports.length > 0
    ).length;
    const totalNotStartedEmployees = filteredEmployeesForMetrics.filter(
      (emp: any) => emp.reports.length === 0
    ).length;
    
    // FIXED: Calculate avgScore using genius_factor_score from risk_analysis.scores
    let totalGeniusScore = 0;
    let totalReportsWithScore = 0;
    
    filteredEmployeesForMetrics.forEach((emp: any) => {
      emp.reports.forEach((report: any) => {
        // Use genius_factor_score from risk_analysis.scores
        const geniusFactorScore = report?.geniusFactorScore || 0;
        if (geniusFactorScore > 0) { // Only count valid scores
          totalGeniusScore += geniusFactorScore;
          totalReportsWithScore += 1;
        }
      });
    });

    const avgScore = totalReportsWithScore > 0 ? Math.round(totalGeniusScore / totalReportsWithScore) : 0;

    // 7. Apply status filter for employee list (same as original)
    let filteredEmployees = Object.values(grouped);

    if (status === "Completed") {
      // Only employees with reports
      filteredEmployees = filteredEmployees.filter((employee: any) => employee.reports.length > 0);
    } else if (status === "Not Started") {
      // Only employees without reports
      filteredEmployees = filteredEmployees.filter((employee: any) => employee.reports.length === 0);
    }
    // If no status or "all", keep ALL employees (including those with and without reports)

    // 8. Sort by ID for consistent ordering
    filteredEmployees = filteredEmployees.sort((a: any, b: any) => a.id.localeCompare(b.id));

    // 9. Calculate filtered total for pagination
    const filteredTotalEmployees = filteredEmployees.length;

    // 10. Apply pagination to filtered results
    const paginatedEmployees = filteredEmployees.slice(skip, skip + limit);

    // 11. Calculate total pages
    const totalPages = Math.ceil(filteredTotalEmployees / limit);

    // 12. Log for debugging
    allUsers.forEach((emp: any) => {
      if (!emp.employee) {
        console.warn(
          `User ${emp.id} (${emp.email}) has no employee record. employeeId: ${emp.employeeId}`
        );
      }
    });

    console.log('Status filter applied:', status, 'Total employees:', filteredTotalEmployees, 'With reports:', usersWithReportsIds.length);
    console.log('Metrics calculated:', { 
      totalAssessments, 
      totalCompletedEmployees, 
      totalNotStartedEmployees, 
      avgScore,
      totalReportsWithScore,
      totalGeniusScore 
    });

    return NextResponse.json(
      {
        // Paginated employees list
        employees: paginatedEmployees,
        pagination: {
          currentPage: page,
          totalPages,
          totalEmployees: filteredTotalEmployees,
          limit,
        },
        // Full metrics data (not paginated)
        metrics: {
          totalAssessments,
          completedCount: totalCompletedEmployees,
          notStartedCount: totalNotStartedEmployees,
          inProgressCount: 0, // No in-progress reports in data
          avgScore,
        }
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