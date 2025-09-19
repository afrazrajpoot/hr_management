import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface CustomSession {
  user?: { id: string; role?: string };
}

export async function GET(request: Request) {
  try {
    // 1. Get the authenticated session
    const session: CustomSession | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (currentUser?.role !== 'Admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 3. Parse query parameters for pagination and filters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const searchTerm = url.searchParams.get("search") || "";
    const department = url.searchParams.get("department") || "";
    const role = url.searchParams.get("role") || "";

    // 4. Build where clause for filters (exclude admin users)
    const whereClause: any = {
      role: {
        not: 'Admin' // Exclude admin employees from results
      }
    };
    
    if (searchTerm) {
      whereClause.OR = [
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { phoneNumber: { contains: searchTerm, mode: "insensitive" } },
        { position: { hasSome: [searchTerm] } },
        { employee: { 
            OR: [
              { firstName: { contains: searchTerm, mode: "insensitive" } },
              { lastName: { contains: searchTerm, mode: "insensitive" } },
              { address: { contains: searchTerm, mode: "insensitive" } },
              { manager: { contains: searchTerm, mode: "insensitive" } }
            ]
          } 
        }
      ];
    }
    
    if (department && department !== "All Departments") {
      whereClause.department = { hasSome: [department] };
    }
    
    if (role && role !== "All Roles") {
      whereClause.role = 'Employee';
    }

    // 5. Fetch total count of all employees with filters
    const totalEmployees = await prisma.user.count({
      where: {
        role:'Employee'
      },
    });

    // 6. Fetch paginated employees with filters and include all details
    const employees = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        // User model fields
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true,
        position: true,
        department: true,
        hrId: true,
        salary: true,
        employeeId: true,
        
        // Employee relation fields
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            address: true,
            dateOfBirth: true,
            hireDate: true,
            manager: true,
            bio: true,
            avatar: true,
            skills: true,
            education: true,
            experience: true,
            resume: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 7. Get HR manager details for employees that have an hrId
    const hrIds = employees.map(emp => emp.hrId).filter(id => id !== null);
    const hrManagers = await prisma.user.findMany({
      where: {
        id: { in: hrIds as string[] }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    });

    // Create a map of HR managers for easy lookup
    const hrManagerMap = new Map();
    hrManagers.forEach(hr => {
      hrManagerMap.set(hr.id, hr);
    });

    // 8. Fetch all reports (admin can see all reports)
    const reports = await prisma.individualEmployeeReport.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        hrId: true,
        executiveSummary: true,
        departement: true,
        geniusFactorProfileJson: true,
        currentRoleAlignmentAnalysisJson: true,
        internalCareerOpportunitiesJson: true,
        retentionAndMobilityStrategiesJson: true,
        developmentActionPlanJson: true,
        personalizedResourcesJson: true,
        dataSourcesAndMethodologyJson: true,
        risk_analysis: true
      },
    });

    // 9. Group reports by userId and add HR manager info
    const grouped: Record<string, any> = {};
    for (const emp of employees) {
      grouped[emp.id] = { 
        ...emp, 
        reports: [],
        hrManager: emp.hrId ? hrManagerMap.get(emp.hrId) || null : null
      };
    }
    
    for (const report of reports) {
      if (grouped[report.userId]) {
        grouped[report.userId].reports.push(report);
      }
    }

    const result = Object.values(grouped);

    // 10. Calculate total pages
    const totalPages = Math.ceil(totalEmployees / limit);

    // 11. Return the response with pagination info
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
    console.error("Error in admin GET endpoint:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}