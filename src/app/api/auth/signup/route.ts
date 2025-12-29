import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

// Set max duration for this route (30 seconds)
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = (body?.firstName ?? '').toString().trim();
    const lastName = (body?.lastName ?? '').toString().trim();
    const phoneNumber = (body?.phoneNumber ?? '').toString().trim();
    const email = (body?.email ?? '').toString().toLowerCase().trim();
    const password = (body?.password ?? '').toString();
    const role = ((body?.role ?? 'Employee').toString().trim() || 'Employee') as string;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (role !== 'Employee' && role !== 'HR') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phoneNumber: phoneNumber || null,
        verificationToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Best-effort verification email; do not fail signup if mail is misconfigured.
    try {
      const { sendVerificationEmail } = await import('@/lib/mail');
      await Promise.race([
        sendVerificationEmail(email, verificationToken),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Verification email timeout')), 5000)
        ),
      ]);
    } catch (error) {
      console.error('Verification email failed, continuing signup...', error);
    }

    return NextResponse.json(
      { success: true, message: 'Account created. Verification code sent.', email },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
