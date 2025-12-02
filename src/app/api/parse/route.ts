// src/app/api/parse/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';

export async function POST(req: NextRequest) {
  try {
    // Get the session to access FastAPI token
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No files provided' }, { status: 400 });
    }

    // Prepare headers with FastAPI token if available
    const headers: Record<string, string> = {};

    if (session.user.fastApiToken) {
      headers['Authorization'] = `Bearer ${session.user.fastApiToken}`;
    }

    // Call the external parsing API with FastAPI token
    const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_URL}/parse/companies`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('FastAPI parsing error:', data);

      // Handle token expiration
      if (res.status === 401) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Authentication expired. Please log in again.',
            code: 'TOKEN_EXPIRED'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          status: 'error',
          message: data.message || data.detail || 'Failed to parse files'
        },
        { status: res.status }
      );
    }

    // Extract the parsed data
    const parsedData = data.data || data;
    let savedCompanies = 0;
    let skippedCompanies = 0;
    const errors: string[] = [];

    // Iterate over each file's parsed_json
    for (const fileData of parsedData) {
      if (fileData.parsed_json && Array.isArray(fileData.parsed_json.companies)) {

        // Save each company individually
        for (const company of fileData.parsed_json.companies) {
          try {
            // Check if company already exists (optional - based on your business logic)
            const existingCompany = await prisma.company.findFirst({
              where: {
                companyDetail: {
                  path: ['name'],
                  equals: company.name
                }
              }
            });

            if (existingCompany) {
              skippedCompanies++;
              console.log(`Company "${company.name}" already exists, skipping...`);
              continue;
            }

            const savedCompany = await prisma.company.create({
              data: {
                companyDetail: company,
                // You can add additional fields if needed, for example:
                // uploadedBy: session.user.id,
                // uploadedAt: new Date(),
              } as any,
            });

            savedCompanies++;
          } catch (dbError: any) {
            const errorMsg = `Error saving company "${company.name}": ${dbError.message}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            skippedCompanies++;
          }
        }
      } else {
        console.warn('File data missing parsed_json or companies array:', fileData);
      }
    }

    // Create a response summary
    const responseSummary = {
      status: 'success',
      message: `Processed ${savedCompanies + skippedCompanies} companies. Saved: ${savedCompanies}, Skipped: ${skippedCompanies}`,
      savedCompanies,
      skippedCompanies,
      totalProcessed: savedCompanies + skippedCompanies,
      filesCount: files.length,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(responseSummary);

  } catch (error: any) {
    console.error('Unexpected error in parse route:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}