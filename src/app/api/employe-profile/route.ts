// src/app/api/employe-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  department?: string;
  position?: string;
  manager?: string;
  employeeId: string;
  salary?: string;
  bio?: string;
  avatar?: string;
  skills: string[];
  education?: Array<{
    id: number;
    degree: string;
    institution: string;
    year: string;
    gpa: string;
  }>;
  experience?: Array<{
    id: number;
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  resume?: {
    name: string;
    size: string;
    type: string;
    uploadDate: string;
  } | null;
}

// GET: Fetch employee data for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if prisma is properly initialized
    if (!prisma || !prisma.employee) {
      console.error('Prisma client or Employee model is not properly initialized');
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    // Get employee with related user data
    const employee = await prisma.employee.findFirst({
      where: { employeeId: session.user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            position: true,
            department: true,
            salary: true
          }
        }
      }
    });

    if (!employee) {
      // If no employee exists, try to get user data
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          position: true,
          department: true,
          salary: true
        }
      });

      return NextResponse.json({
        id: '',
        employeeId: session.user.id,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        address: '',
        dateOfBirth: '',
        hireDate: '',
        department: user?.department || '',
        position: user?.position || '',
        manager: '',
        salary: user?.salary || '',
        bio: '',
        avatar: '',
        skills: [],
        education: [],
        experience: [],
        resume: null,
      });
    }

    // Merge data from both employee and user models
    return NextResponse.json({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.user?.firstName || employee.firstName,
      lastName: employee.user?.lastName || employee.lastName,
      email: employee.user?.email || employee.email,
      phone: employee.user?.phoneNumber || employee.phone || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth?.toISOString().split('T')[0] || '',
      hireDate: employee.hireDate?.toISOString().split('T')[0] || '',
      department: employee.user?.department || employee.department || '',
      position: employee.user?.position || employee.position || '',
      manager: employee.manager || '',
      salary: employee.user?.salary || employee.salary || '',
      bio: employee.bio || '',
      avatar: employee.avatar || '',
      skills: employee.skills,
      education: employee.education || [],
      experience: employee.experience || [],
      resume: employee.resume || null,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update employee data
// POST: Create or update employee data
// POST: Create or update employee data
// POST: Create or update employee data
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if prisma is properly initialized
    if (!prisma || !prisma.employee) {
      console.error('Prisma client or Employee model is not properly initialized');
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    const data: EmployeeData = await req.json();

    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, or email' },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: { employeeId: session.user.id },
      include: { user: true }
    });

    let employee;
    
    // Start a transaction to update both Employee and User
    const result = await prisma.$transaction(async (tx:any) => {
      // First update the User model with user-specific fields
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phone,
          position: data.position,
          department: data.department,
          salary: data.salary
        }
      });

      // Prepare employee data (only fields that exist in Employee model)
      const employeeData = {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        bio: data.bio || null,
        avatar: data.avatar || null,
        skills: data.skills || [],
        education: data.education || [],
        experience: data.experience || [],
        resume: data.resume || null,
      };

      if (existingEmployee) {
        // Update existing employee
        employee = await tx.employee.update({
          where: { id: existingEmployee.id },
          data: employeeData
        });
      } else {
        // Create new employee
        employee = await tx.employee.create({
          data: {
            employeeId: session.user.id,
            ...employeeData,
            user: {
              connect: { id: session.user.id },
            },
          },
        });

        // Update the user with the employeeId reference
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            employeeId: employee.id
          }
        });
      }

      return { employee, user: updatedUser };
    });

    employee = result.employee;
    const user = result.user;

    return NextResponse.json({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: user.firstName || employee.firstName,
      lastName: user.lastName || employee.lastName,
      email: user.email || '',
      phone: user.phoneNumber || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth?.toISOString().split('T')[0] || '',
      hireDate: employee.hireDate?.toISOString().split('T')[0] || '',
      department: user.department || '',
      position: user.position || '',
      salary: user.salary || '',
      bio: employee.bio || '',
      avatar: employee.avatar || '',
      skills: employee.skills,
      education: employee.education || [],
      experience: employee.experience || [],
      resume: employee.resume || null,
    });
  } catch (error: any) {
    console.error('Error creating/updating employee:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Employee ID or email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}