import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { fetchWithTimeout } from '@/lib/utils';

export async function POST(req: NextRequest) {

  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No files provided' }, { status: 400 });
    }

    // Call the external parsing API with FastAPI token
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_PYTHON_URL}/parse/companies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.fastApiToken}`
      },
      body: formData,
      timeout: 60000, // 60 seconds
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { status: 'error', message: data.message || 'Failed to parse files' },
        { status: res.status }
      );
    }

    // Extract the parsed data
    const parsedData = data.data || data;

    // Process employees for sign-up
    const employees = parsedData[0]?.parsed_json?.employees || [];
    const signUpResults = [];

    if (employees.length > 0) {
      const emails = employees.map((e: any) => e.Email).filter(Boolean);

      // Find existing users in one query
      const existingUsers = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true }
      });

      const existingEmails = new Set(existingUsers.map(u => u.email));
      const hashedPassword = await bcrypt.hash('Pa$$w0rd!', 10);

      for (const employee of employees) {
        try {
          if (existingEmails.has(employee.Email)) {
            signUpResults.push({
              employee: employee.Email,
              status: 'error',
              message: 'User already exists',
            });
            continue;
          }

          // Create new user
          await prisma.user.create({
            data: {
              firstName: employee.firstName || employee.Name || 'Not provide',
              lastName: employee.lastName || 'Not provide',
              email: employee.Email || 'Not provide',
              password: hashedPassword,
              role: 'Employee',
              salary: employee.Salary ? String(employee.Salary) : '0',
              phoneNumber: employee.Phone || 'Not provide',
              department: employee.Department ? [employee.Department] : ['Not provide'],
              createdAt: new Date(),
              hrId: session.user.id,
            },
          });

          signUpResults.push({
            employee: employee.Email,
            status: 'success',
            message: 'User created successfully',
          });
        } catch (signUpError) {
          signUpResults.push({
            employee: employee.Email,
            status: 'error',
            message: signUpError instanceof Error ? signUpError.message : 'Sign-up failed',
          });
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      response: parsedData,
      signUpResults,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}