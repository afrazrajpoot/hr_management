import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        accounts: true,
        sessions: true,
        jobs: true,
      },
    });

    const hrData = [];

    // Iterate through each HR user
    for (const hrUser of hrUsers) {
      // Fetch the company where this HR's ID is in the hrId array
      const company = await prisma.company.findFirst({
        where: {
          hrId: {
            has: hrUser.id,
          },
        },
      });

      // Fetch employees assigned to this HR (hrId matches and role is not 'HR')
      const employees = await prisma.user.findMany({
        where: {
          hrId: hrUser.id,
          role: {
            not: 'HR',
          },
        },
        include: {
          employee: true, // Include employee relation
          applications: true, // Include applications if needed
        },
      });

      // Fetch individual reports for employees, matching hrId
      const employeesWithReports = await Promise.all(
        employees.map(async (employee) => {
          const report = await prisma.individualEmployeeReport.findFirst({
            where: {
              userId: employee.id,
              hrId: hrUser.id,
            },
          });
          return {
            employee,
            report, // Report may be null if none exists
          };
        })
      );

      // Construct HR data object
      hrData.push({
        hrUser,
        company, // May be null if no company is associated
        employees: employeesWithReports,
      });
    }

    return NextResponse.json({ data: hrData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching HR data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}