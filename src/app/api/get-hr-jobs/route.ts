// app/api/hr/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';

// Set max duration for this route (30 seconds)
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Check if user is HR/recruiter (e.g., via role)
    // if (session.user.role !== 'HR') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const jobs = await prisma.job.findMany({
      where: {
        recruiterId: session.user.id,
        applications: {
          some: {}
        }
      },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                position: true,
                department: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      jobs
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching HR jobs and applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}