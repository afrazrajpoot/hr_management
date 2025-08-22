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

    const employee = await prisma.employee.findFirst({
      where: { employeeId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({
        id: '',
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        hireDate: '',
        department: '',
        position: '',
        manager: '',
        salary: '',
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
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth?.toISOString().split('T')[0] || '',
      hireDate: employee.hireDate?.toISOString().split('T')[0] || '',
      department: employee.department || '',
      position: employee.position || '',
      manager: employee.manager || '',
      salary: employee.salary || '',
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
    });

    let employee;
    if (existingEmployee) {
      employee = await prisma.employee.update({
        where: { id: existingEmployee.id },
        data: {
          employeeId: existingEmployee.employeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          hireDate: data.hireDate ? new Date(data.hireDate) : null,
          department: data.department || null,
          position: data.position || null,
          manager: data.manager || null,
          salary: data.salary || null,
          bio: data.bio || null,
          avatar: data.avatar || null,
          skills: data.skills || [],
          education: data.education || [],
          experience: data.experience || [],
          resume: data.resume || null,
          user: {
            connect: { id: session.user.id }, // ✅ Connect existing User
          },
     
        },
      });
    } else {
      employee = await prisma.employee.create({
        data: {
          employeeId: session.user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          hireDate: data.hireDate ? new Date(data.hireDate) : null,
          department: data.department || null,
          position: data.position || null,
          manager: data.manager || null,
          salary: data.salary || null,
          bio: data.bio || null,
          avatar: data.avatar || null,
          skills: data.skills || [],
          education: data.education || [],
          experience: data.experience || [],
          resume: data.resume || null,
          user: {
            connect: { id: session.user.id }, // ✅ Connect existing User
          },
        },
      });
      
    }

    return NextResponse.json({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth?.toISOString().split('T')[0] || '',
      hireDate: employee.hireDate?.toISOString().split('T')[0] || '',
      department: employee.department || '',
      position: employee.position || '',
      manager: employee.manager || '',
      salary: employee.salary || '',
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