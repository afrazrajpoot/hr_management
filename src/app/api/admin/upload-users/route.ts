import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import * as XLSX from 'xlsx';

// Set max duration for user upload (120 seconds for file processing)
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    // Check if user is authenticated and is Admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const role = formData.get('role') as string;

    if (!file) {
      return NextResponse.json({
        status: 'error',
        message: 'No file provided'
      }, { status: 400 });
    }

    if (!role || (role !== 'HR' && role !== 'Employee')) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid role. Role must be either HR or Employee'
      }, { status: 400 });
    }

    // Read the file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the file based on extension
    const fileName = file.name.toLowerCase();
    let users: any[] = [];

    try {
      // Check for supported file formats including ODS
      if (fileName.endsWith('.ods') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Parse Excel/ODS file
        const workbook = XLSX.read(buffer, {
          type: 'buffer',
          // Add specific options for ODS if needed
          cellDates: true,
          cellNF: false,
          cellText: false
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Map the data to user format
        users = data.map((row: any) => {
          // Handle different possible column names (case-insensitive)
          const getValue = (keys: string[]) => {
            for (const key of keys) {
              const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
              if (found && row[found]) return row[found];
            }
            return null;
          };

          return {
            firstName: getValue(['firstName', 'first name', 'firstname', 'name', 'fname']) || '',
            lastName: getValue(['lastName', 'last name', 'lastname', 'lname', 'surname']) || '',
            email: getValue(['email', 'e-mail', 'email address', 'mail']) || '',
            phoneNumber: getValue(['phone', 'phone number', 'phonenumber', 'mobile', 'contact']) || '',
            password: getValue(['password', 'pass']) || 'Pa$$w0rd!', // Default password if not provided
          };
        });
      } else if (fileName.endsWith('.csv')) {
        // Parse CSV file
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        users = data.map((row: any) => {
          const getValue = (keys: string[]) => {
            for (const key of keys) {
              const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
              if (found && row[found]) return row[found];
            }
            return null;
          };

          return {
            firstName: getValue(['firstName', 'first name', 'firstname', 'name', 'fname']) || '',
            lastName: getValue(['lastName', 'last name', 'lastname', 'lname', 'surname']) || '',
            email: getValue(['email', 'e-mail', 'email address', 'mail']) || '',
            phoneNumber: getValue(['phone', 'phone number', 'phonenumber', 'mobile', 'contact']) || '',
            password: getValue(['password', 'pass']) || 'Pa$$w0rd!',
          };
        });
      } else {
        return NextResponse.json({
          status: 'error',
          message: 'Unsupported file format. Please upload .ods, .xlsx, .xls, or .csv file'
        }, { status: 400 });
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return NextResponse.json({
        status: 'error',
        message: 'Failed to parse file. Please ensure the file format is correct.'
      }, { status: 400 });
    }

    if (users.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No user data found in the file'
      }, { status: 400 });
    }

    // Rest of your code remains the same...
    // Process users and save to database
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    if (users.length > 0) {
      const emails = users.map(u => u.email).filter(Boolean);

      // Find existing users in one query
      const existingUsers = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true }
      });

      const existingEmails = new Set(existingUsers.map(u => u.email));

      for (const userData of users) {
        try {
          // Validate required fields
          if (!userData.email || !userData.firstName) {
            results.push({
              email: userData.email || 'N/A',
              status: 'error',
              message: 'Missing required fields (email and firstName)',
            });
            errorCount++;
            continue;
          }

          // Check if user already exists using the pre-fetched set
          if (existingEmails.has(userData.email)) {
            results.push({
              email: userData.email,
              status: 'error',
              message: 'User already exists',
            });
            errorCount++;
            continue;
          }

          // Hash the password
          const hashedPassword = await bcrypt.hash(userData.password, 10);

          // Create new user with the selected role
          const user = await prisma.user.create({
            data: {
              firstName: userData.firstName,
              lastName: userData.lastName || '',
              email: userData.email,
              password: hashedPassword,
              role: role, // Use the selected role (HR or Employee)
              phoneNumber: userData.phoneNumber || '',
              createdAt: new Date(),
            },
          });

          results.push({
            email: userData.email,
            status: 'success',
            message: `User created successfully with ${role} role`,
            userId: user.id,
          });
          successCount++;
        } catch (userError: any) {
          results.push({
            email: userData.email || 'N/A',
            status: 'error',
            message: userError.message || 'Failed to create user',
          });
          errorCount++;
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: `Processed ${users.length} users. ${successCount} created successfully, ${errorCount} failed.`,
      total: users.length,
      success: successCount,
      errors: errorCount,
      results: results,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}