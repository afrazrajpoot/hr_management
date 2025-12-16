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

    // DECODE all parameters to handle URL encoding
    const searchTerm = decodeURIComponent(url.searchParams.get("search") || "");
    const department = decodeURIComponent(url.searchParams.get("department") || "");
    const risk = decodeURIComponent(url.searchParams.get("risk") || "");
    const status = decodeURIComponent(url.searchParams.get("status") || "");

    // Debug log
    console.log('Search parameters received:', {
      rawSearch: url.searchParams.get("search"),
      decodedSearch: searchTerm,
      department,
      risk,
      status
    });

    // Build where clause for users
    const whereClause: any = { hrId: session.user.id };

    // 1. Fetch all users for this HR first
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
    const allUserIds = allUsers.map((user: any) => user.id);

    // 3. Fetch all reports under this HR
    let reports = await prisma.individualEmployeeReport.findMany({
      where: {
        hrId: session.user.id,
        userId: { in: allUserIds }
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

    // 5. Group reports by userId
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

    // Calculate avgScore
    let totalGeniusScore = 0;
    let totalReportsWithScore = 0;

    filteredEmployeesForMetrics.forEach((emp: any) => {
      emp.reports.forEach((report: any) => {
        const geniusFactorScore = report?.geniusFactorScore || 0;
        if (geniusFactorScore > 0) {
          totalGeniusScore += geniusFactorScore;
          totalReportsWithScore += 1;
        }
      });
    });

    const avgScore = totalReportsWithScore > 0 ? Math.round(totalGeniusScore / totalReportsWithScore) : 0;

    // 7. Apply FILTERS to the employee list (Search, Department, Status)
    let filteredEmployees = Object.values(grouped);

    // A. Apply Search Filter (In-Memory) - FIXED VERSION
    if (searchTerm && searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase().trim();
      console.log('Applying search filter for term:', lowerSearch);

      filteredEmployees = filteredEmployees.filter((emp: any) => {
        // Search in name (first name + last name)
        const firstName = (emp.firstName || "").toLowerCase();
        const lastName = (emp.lastName || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const nameMatch = firstName.includes(lowerSearch) ||
          lastName.includes(lowerSearch) ||
          fullName.includes(lowerSearch);

        // Search in email - ensure case insensitive
        const email = (emp.email || "").toLowerCase();
        const emailMatch = email.includes(lowerSearch);

        // Search in position - handle various data types
        let positionMatch = false;

        if (emp.position) {
          if (Array.isArray(emp.position)) {
            // Handle array of positions
            positionMatch = emp.position.some((pos: any) => {
              if (typeof pos === 'string') {
                return pos.toLowerCase().includes(lowerSearch);
              } else if (pos && typeof pos === 'object') {
                const posString = JSON.stringify(pos).toLowerCase();
                return posString.includes(lowerSearch);
              }
              return false;
            });
          } else if (typeof emp.position === 'string') {
            // Handle string position
            positionMatch = emp.position.toLowerCase().includes(lowerSearch);
          } else if (typeof emp.position === 'object') {
            // Handle object position
            const posString = JSON.stringify(emp.position).toLowerCase();
            positionMatch = posString.includes(lowerSearch);
          }
        }

        // Return true if any search field matches
        return nameMatch || emailMatch || positionMatch;
      });

      console.log('Number of employees after search filtering:', filteredEmployees.length);
    }

    // B. Apply Department Filter (In-Memory)
    if (department && department !== "All Departments") {
      filteredEmployees = filteredEmployees.filter((emp: any) => {
        if (Array.isArray(emp.department)) {
          return emp.department.includes(department);
        }
        return emp.department === department;
      });
    }

    // C. Apply Status Filter
    if (status === "Completed") {
      filteredEmployees = filteredEmployees.filter((employee: any) => employee.reports.length > 0);
    } else if (status === "Not Started") {
      filteredEmployees = filteredEmployees.filter((employee: any) => employee.reports.length === 0);
    }

    // 8. Sort by ID for consistent ordering
    filteredEmployees = filteredEmployees.sort((a: any, b: any) => a.id.localeCompare(b.id));

    // 9. Calculate filtered total for pagination
    const filteredTotalEmployees = filteredEmployees.length;

    // 10. Apply pagination to filtered results
    const paginatedEmployees = filteredEmployees.slice(skip, skip + limit);

    // 11. Calculate total pages
    const totalPages = Math.ceil(filteredTotalEmployees / limit);

    return NextResponse.json(
      {
        employees: paginatedEmployees,
        pagination: {
          currentPage: page,
          totalPages,
          totalEmployees: filteredTotalEmployees,
          limit,
        },
        metrics: {
          totalAssessments,
          completedCount: totalCompletedEmployees,
          notStartedCount: totalNotStartedEmployees,
          inProgressCount: 0,
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