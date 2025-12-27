// src/app/api/parse/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { fetchWithTimeout } from '@/lib/utils';

// Set max duration for file parsing (120 seconds for large file uploads)
export const maxDuration = 120;

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
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_PYTHON_URL}/parse/companies`, {
      method: 'POST',
      headers: headers,
      body: formData,
      timeout: 60000, // 60 seconds for parsing
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

    // Collect all companies from all files
    const allCompanies: any[] = [];
    for (const fileData of parsedData) {
      if (fileData.parsed_json && Array.isArray(fileData.parsed_json.companies)) {
        allCompanies.push(...fileData.parsed_json.companies);
      }
    }

    if (allCompanies.length > 0) {
      // Optimize: Batch check existing companies to reduce database queries
      const companyNames = [...new Set(allCompanies.map(c => c.name).filter(Boolean))];
      
      // Fetch all companies with matching names in a single query
      // Since Prisma JSON filtering is limited, we'll fetch all and filter in memory
      // This is still better than N queries
      const allExistingCompanies = await prisma.company.findMany({
        select: {
          id: true,
          companyDetail: true,
        },
        take: 10000, // Limit to prevent memory issues
      });

      // Create a Set of existing company names for O(1) lookup
      const existingCompanyNames = new Set(
        allExistingCompanies
          .map(c => c.companyDetail && typeof c.companyDetail === 'object' && 'name' in c.companyDetail 
            ? (c.companyDetail as any).name 
            : null)
          .filter(Boolean)
      );

      // Batch create companies that don't exist
      const companiesToCreate = allCompanies.filter(
        company => company.name && !existingCompanyNames.has(company.name)
      );

      // Use createMany for better performance (if supported) or batch creates
      if (companiesToCreate.length > 0) {
        // Process in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < companiesToCreate.length; i += batchSize) {
          const batch = companiesToCreate.slice(i, i + batchSize);
          
          await Promise.allSettled(
            batch.map(async (company) => {
              try {
                await prisma.company.create({
                  data: {
                    companyDetail: company,
                  } as any,
                });
                savedCompanies++;
              } catch (dbError: any) {
                errors.push(`Error saving company "${company.name}": ${dbError.message}`);
                skippedCompanies++;
              }
            })
          );
        }
      }

      // Count skipped companies
      skippedCompanies += allCompanies.length - companiesToCreate.length;
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
  }
}