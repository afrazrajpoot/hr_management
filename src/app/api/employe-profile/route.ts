import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
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

    if (!prisma || !prisma.employee) {
      console.error('Prisma client or Employee model is not properly initialized');
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

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
            salary: true,
            password: true
          }
        }
      }
    });

    if (!employee) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          position: true,
          department: true,
          salary: true,
          password: true
        }
      });

      return NextResponse.json({
        id: '',
        employeeId: session.user.id,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        password: user?.password ? '********' : '',
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

    return NextResponse.json({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.user?.firstName || employee.firstName,
      lastName: employee.user?.lastName || employee.lastName,
      email: employee.user?.email || employee.email,
      password: employee.user?.password ? '********' : '',
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

// POST: Create or update employee data with secure password handling
// POST: Create or update employee data with secure password handling
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Validate password only if provided and not masked
    if (data.password && data.password !== '********') {
      if (data.password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      // Additional password validation (e.g., complexity)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(data.password)) {
        return NextResponse.json(
          {
            error:
              'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          },
          { status: 400 }
        );
      }
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: { employeeId: session.user.id },
      include: { user: true }
    });

    let employee;

    const result = await prisma.$transaction(async (tx: any) => {
      const userData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        position: data.position,
        department: data.department,
        salary: data.salary
      };

      // Hash password only if provided and not masked
      if (data.password && data.password !== '********') {
        userData.password = await bcrypt.hash(data.password, 10);
      }

      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: userData
      });

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
        manager: data.manager
      };

      if (existingEmployee) {
        employee = await tx.employee.update({
          where: { id: existingEmployee.id },
          data: employeeData
        });
      } else {
        employee = await tx.employee.create({
          data: {
            employeeId: session.user.id,
            ...employeeData,
            user: {
              connect: { id: session.user.id }
            }
          }
        });

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
      password: '********', // Always return masked password
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
      resume: employee.resume || null
    });
  } catch (error: any) {
    console.error('Error creating/updating employee:', error);
    if (
      error.message === 'Password must be at least 8 characters long' ||
      error.message.includes('Password must contain')
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Employee ID or email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}