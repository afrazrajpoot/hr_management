import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';

    // Build where clause for HR users
    const whereClause: any = {
      role: 'HR',
    };

    if (searchTerm) {
      whereClause.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Fetch HR users (role === 'HR')
    const hrUsers = await prisma.user.findMany({
      where: whereClause,
      include: {
        jobs: true,
      },
    });

    if (hrUsers.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const hrIds = hrUsers.map(u => u.id);

    // Fetch all companies that have any of these HRs
    const allCompanies = await prisma.company.findMany({
      where: {
        hrId: {
          hasSome: hrIds,
        },
      },
    });

    // Fetch all employees assigned to these HRs
    const allEmployees = await prisma.user.findMany({
      where: {
        hrId: {
          in: hrIds,
        },
        role: {
          not: 'HR',
        },
      },
      include: {
        employee: true,
      },
    });

    // Fetch all reports for these employees and HRs
    const employeeIds = allEmployees.map(e => e.id);
    const allReports = await prisma.individualEmployeeReport.findMany({
      where: {
        userId: { in: employeeIds },
        hrId: { in: hrIds },
      },
    });

    // Construct the response data by mapping in memory
    const hrData = hrUsers.map(hrUser => {
      const company = allCompanies.find(c => c.hrId.includes(hrUser.id)) || null;

      const hrEmployees = allEmployees.filter(e => e.hrId === hrUser.id);

      const employeesWithReports = hrEmployees.map(employee => {
        const report = allReports.find(r => r.userId === employee.id && r.hrId === hrUser.id) || null;
        return {
          employee,
          report,
        };
      });

      return {
        hrUser,
        company,
        employees: employeesWithReports,
      };
    });

    return NextResponse.json({ data: hrData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching HR data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}