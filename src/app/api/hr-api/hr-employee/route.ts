import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Set max duration for this route (60 seconds - can be adjusted based on data size)
export const maxDuration = 60;

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

    // Avoid noisy request logging in production.

    // Build base where clause for users
    const userWhere: any = { hrId: session.user.id };

    // 1. Apply Search Filter (DB Level)
    if (searchTerm && searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.trim();
      userWhere.OR = [
        { firstName: { contains: lowerSearch, mode: 'insensitive' } },
        { lastName: { contains: lowerSearch, mode: 'insensitive' } },
        { email: { contains: lowerSearch, mode: 'insensitive' } },
      ];
    }

    // 2. Apply Department Filter (DB Level)
    if (department && department !== "All Departments") {
      userWhere.department = { has: department };
    }

    // 3. Handle Risk and Status filters (Requires subqueries or separate ID fetching)
    let userIdsWithReports: string[] = [];
    const needsReportCheck = (risk && risk !== "All Risk Levels") || status !== "";

    if (needsReportCheck) {
      const reportWhere: any = { hrId: session.user.id };

      if (risk && risk !== "All Risk Levels") {
        reportWhere.currentRoleAlignmentAnalysisJson = {
          path: ['retention_risk_level'],
          equals: risk
        };
      }

      const reports = await prisma.individualEmployeeReport.findMany({
        where: reportWhere,
        select: { userId: true }
      });

      userIdsWithReports = [...new Set(reports.map(r => r.userId))];

      if (status === "Completed") {
        userWhere.id = { in: userIdsWithReports };
      } else if (status === "Not Started") {
        // To get "Not Started", we need to exclude all users who HAVE reports
        const allUserIdsWithAnyReport = await prisma.individualEmployeeReport.findMany({
          where: { hrId: session.user.id },
          select: { userId: true }
        });
        const excludedIds = allUserIdsWithAnyReport.map(r => r.userId);
        userWhere.id = { notIn: excludedIds };
      } else if (risk && risk !== "All Risk Levels") {
        // If only risk is specified, we filter by those who have matching reports
        userWhere.id = { in: userIdsWithReports };
      }
    }

    // 4. Fetch paginated users and total count
    const [users, totalEmployees] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          salary: true,
          department: true,
          position: true,
          employeeId: true,
          employee: true,
        },
        orderBy: { id: 'asc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: userWhere })
    ]);

    // 5. Fetch reports for the current page users
    const userIds = users.map(u => u.id);
    const reports = await prisma.individualEmployeeReport.findMany({
      where: {
        hrId: session.user.id,
        userId: { in: userIds }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 6. Map reports back to users
    const employees = users.map(user => ({
      ...user,
      reports: reports.filter(r => r.userId === user.id)
    }));

    // 7. Calculate Metrics (Optimized - prevent duplicate queries)
    // Fetch report user IDs once to reuse for metrics calculations
    const allReportUserIds = await prisma.individualEmployeeReport.findMany({
      where: { hrId: session.user.id },
      select: { userId: true }
    });
    const allReportUserIdsSet = new Set(allReportUserIds.map(r => r.userId));

    // For metrics, we need counts across the whole HR scope, possibly filtered by department/search
    const metricsWhere: any = { hrId: session.user.id };
    if (userWhere.department) metricsWhere.department = userWhere.department;
    if (userWhere.OR) metricsWhere.OR = userWhere.OR;

    // Optimize: Use the already fetched report user IDs instead of querying again
    const [totalCompleted, totalNotStarted, geniusScores] = await Promise.all([
      prisma.user.count({
        where: {
          ...metricsWhere,
          id: { in: Array.from(allReportUserIdsSet) }
        }
      }),
      prisma.user.count({
        where: {
          ...metricsWhere,
          id: { notIn: Array.from(allReportUserIdsSet) }
        }
      }),
      prisma.individualEmployeeReport.aggregate({
        where: { hrId: session.user.id },
        _avg: { geniusFactorScore: true },
        _count: { id: true }
      })
    ]);

    const totalPages = Math.ceil(totalEmployees / limit);

    return NextResponse.json(
      {
        employees,
        pagination: {
          currentPage: page,
          totalPages,
          totalEmployees,
          limit,
        },
        metrics: {
          totalAssessments: geniusScores._count.id,
          completedCount: totalCompleted,
          notStartedCount: totalNotStarted,
          inProgressCount: 0,
          avgScore: Math.round(geniusScores._avg.geniusFactorScore || 0),
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