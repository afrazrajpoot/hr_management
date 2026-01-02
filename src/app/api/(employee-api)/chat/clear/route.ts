// app/api/chat/clear/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Delete all EmployeeChat records for the user
    const deletedChats = await prisma.employeeChat.deleteMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({ message: 'Chat history cleared successfully', deleted: deletedChats.count });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json({ error: 'Failed to clear chat history' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}