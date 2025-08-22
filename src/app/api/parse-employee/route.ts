import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No files provided' }, { status: 400 });
    }

    // Call the external parsing API
    const res = await fetch('http://127.0.0.1:8000/parse/companies', {
      method: 'POST',
      body: formData,
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

    for (const employee of employees) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: employee.Email },
        });

        if (existingUser) {
          signUpResults.push({
            employee: employee.Email,
            status: 'error',
            message: 'User already exists',
          });
          continue;
        }

        // Hash the default password
        const hashedPassword = await bcrypt.hash('Pa$$w0rd!', 10);

        // Create new user
        const user = await prisma.user.create({
          data: {
            name: employee.Name,
            email: employee.Email,
            password: hashedPassword,
            role: 'Employee',
            createdAt: new Date(),
            // Optional fields: emailVerified and image are left as null
            // accounts and sessions are managed by NextAuth, not set here
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
  } finally {
    await prisma.$disconnect();
  }
}