import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all HR users (role === 'HR')
    const hrUsers = await prisma.user.findMany({
      where: {
        role: 'HR',
      },
      include: {
        accounts: true, // Include accounts if needed
        sessions: true, // Include sessions if needed
        jobs: true, // Include jobs posted by HR (RecruiterJobs relation)
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