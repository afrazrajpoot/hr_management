import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { prisma } from '@/lib/prisma'; // Adjust the path to your Prisma client instance
import { authOptions } from '@/app/auth';

// Set max duration for this route (30 seconds)
export const maxDuration = 30;

// GET method to fetch AnalysisResult records by hrid
export async function GET(request: Request) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has an hrid
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: No valid session or hrid found' },
        { status: 401 }
      );
    }

    const hrid = session.user.id;

    // Query the database using Prisma to get AnalysisResult records matching the hrid
    const analysisResults = await prisma.analysisResult.findMany({
      where: {
        hrid: hrid,
      },
      select: {
        id: true,
        hrid: true,
        department_name: true,
        ai_response: true,
        risk_score: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc', // Optional: Sort by creation date, newest first
      },
    });

    // Return the results
    return NextResponse.json(
      {
        message: 'Analysis results retrieved successfully',
        data: analysisResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}