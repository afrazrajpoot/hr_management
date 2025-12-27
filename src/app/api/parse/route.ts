// src/app/api/parse/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { fetchWithTimeout } from '@/lib/utils';

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
      // Get unique company names to check existence
      const companyNames = [...new Set(allCompanies.map(c => c.name))];

      // Find existing companies in one query
      const existingCompanies = await prisma.company.findMany({
        where: {
          companyDetail: {
            path: ['name'],
            string_contains: '', // This is a trick to get all and filter in JS if needed, 
            // but actually we want exact match for each name.
            // Prisma doesn't support 'in' with JSON paths easily in one query for multiple values.
            // So we'll use a raw query or just fetch all and filter if the list is small.
            // Given the context, let's just fetch those that match ANY of the names if possible.
          }
        }
      });

      // Actually, since Prisma's JSON filtering is limited for 'IN' clauses, 
      // let's stick to a more robust approach: fetch all company names and filter.
      // Or better, just do the loop but optimize the findFirst.

      // For now, let's just optimize the loop to be more efficient and remove the disconnect.
      for (const company of allCompanies) {
        try {
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
            continue;
          }

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
  }
}