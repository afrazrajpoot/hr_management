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

    // 3. Log users with missing employee data for debugging
    employees.forEach((emp: any) => {
      if (!emp.employee) {
        console.warn(`User ${emp.id} (${emp.email}) has no employee record. employeeId: ${emp.employeeId}`);
      }
    });

    // 4. Fetch all departments under this HR
    const departments = await prisma.department.findMany({
      where: { hrId: session.user.id },
      select: {
        id: true,
        name: true,
        position: true,
        hrId: true,
        userId: true,
      },
    });

    // 5. Group departments by userId and parse JSON fields
    const grouped: Record<string, any> = {};
    for (const emp of employees) {
      grouped[emp.id] = { ...emp, departments: [], reports: [] }; // Initialize with empty arrays
    }
    for (const dept of departments) {
      if (grouped[dept.userId]) {
        // Parse JSON fields to ensure name and position are arrays
        let parsedName: string[] = [];
        let parsedPosition: string[] = [];

        try {
          // Handle name field
          if (typeof dept.name === "string") {
            parsedName = JSON.parse(dept.name); // Parse JSON string
            // Flatten if nested array (e.g., [["IT"], "Data"] -> ["IT", "Data"])
            parsedName = Array.isArray(parsedName) ? parsedName.flat() : [parsedName];
          } else if (Array.isArray(dept.name)) {
            parsedName = dept.name.flat(); // Handle case where name is already an array
          }

          // Handle position field
          if (typeof dept.position === "string") {
            parsedPosition = JSON.parse(dept.position); // Parse JSON string
            // Flatten if nested array
            parsedPosition = Array.isArray(parsedPosition) ? parsedPosition.flat() : [parsedPosition];
          } else if (Array.isArray(dept.position)) {
            parsedPosition = dept.position.flat(); // Handle case where position is already an array
          }
        } catch (e) {
          console.warn(`Failed to parse JSON for department ${dept.id}:`, e);
          parsedName = [dept.name as string]; // Fallback to string as array
          parsedPosition = [dept.position as string]; // Fallback to string as array
        }

        // Add department with parsed fields
        grouped[dept.userId].departments.push({
          ...dept,
          name: parsedName,
          position: parsedPosition,
        });
      }
    }

    // 6. Fetch all reports under this HR
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

    // 7. Group reports by userId
    for (const report of reports) {
      if (grouped[report.userId]) {
        grouped[report.userId].reports.push(report);
      }
    }

    // 8. Return all employees with their departments and reports
    const result = Object.values(grouped);

    // 9. Return the response
    return NextResponse.json({ employees: result }, { status: 200 });
  } catch (err: any) {
    console.error("Error in GET endpoint:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}