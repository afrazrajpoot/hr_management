// app/api/chat-conversations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma'; // Adjust path to your Prisma client
import { authOptions } from '@/app/auth';


// GET handler to fetch chat conversation
export async function GET(request: Request) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get hr_id from session (adjust based on your session structure)
    const hr_id = session.user.id; // Assuming hr_id is stored in session
    if (!hr_id) {
      return NextResponse.json(
        { error: 'HR ID not found in session' },
        { status: 400 }
      );
    }

    // Get department from search params
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    // Manually validate department
    if (!department || department.trim() === '') {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      );
    }

    // Query the database using Prisma
    const conversation = await prisma.chatConversation.findUnique({
      where: {
        hr_id_department: {
          hr_id,
          department,
        },
      },
      select: {
        id: true,
        hr_id: true,
        department: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Check if conversation exists
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Return the conversation
    return NextResponse.json(
      { data: conversation },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}