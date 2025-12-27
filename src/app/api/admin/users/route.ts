import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// GET - Fetch users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || ''; // Filter by role: HR, Employee, or empty for all

    const skip = (page - 1) * limit;

    // Build where clause - exclude Admin users
    const where: any = {
      role: {
        not: 'Admin'
      }
    };

    // Role filter
    if (role && (role === 'HR' || role === 'Employee')) {
      where.role = role;
    }

    // Search filter - by email and name
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        {
          AND: [
            { firstName: { contains: search.split(' ')[0], mode: 'insensitive' } },
            { lastName: { contains: search.split(' ')[1] || '', mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          image: true,
          paid: true,
          amount: true,
          quota: true,
          hrId: true,
          department: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Get job and application counts for HR users
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        let jobCount = 0;
        let applicationCount = 0;

        if (user.role === 'HR') {
          [jobCount, applicationCount] = await Promise.all([
            prisma.job.count({ where: { recruiterId: user.id } }),
            prisma.application.count({ where: { hrId: user.id } })
          ]);
        }

        return {
          ...user,
          jobCount,
          applicationCount
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: usersWithCounts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update user (verify email, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, action, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Handle verify email action
    if (action === 'verify') {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date()
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'User email verified successfully',
        user
      });
    }

    // Handle other updates
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        paid: true,
        amount: true,
        quota: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a single user manually
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, password, role } = body;

    // Validate required fields
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and first name are required' },
        { status: 400 }
      );
    }

    if (!role || (role !== 'HR' && role !== 'Employee')) {
      return NextResponse.json(
        { error: 'Invalid role. Role must be either HR or Employee' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the password (use default if not provided)
    const defaultPassword = password || 'Pa$$w0rd!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || '',
        email,
        password: hashedPassword,
        role,
        phoneNumber: phoneNumber || '',
        createdAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User created successfully with ${role} role`,
      user,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete related records first, then the user
    await prisma.$transaction([
      prisma.account.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.application.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    return NextResponse.json({
      success: true,
      message: `User ${user.email} deleted successfully`
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

