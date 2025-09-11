// src/app/api/parse/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No files provided' }, { status: 400 });
    }

    // Call the external parsing API
    const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_URL}/parse/companies`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { status: 'error', message: data.message || 'Failed to parse files' },
        { status: res.status }
      );
    }

    // Extract the parsed data
    const parsedData = data.data || data;
    let savedCompanies = 0;

    // Iterate over each file's parsed_json
    for (const fileData of parsedData) {
      if (fileData.parsed_json && Array.isArray(fileData.parsed_json.companies)) {

        
        // Save each company individually
        for (const company of fileData.parsed_json.companies) {
          try {
          
            
            const savedCompany = await prisma.company.create({
              data: {
                companyDetail: company,
              },
            }as any);
            
        
            savedCompanies++;
          } catch (dbError) {
            console.error('Database save error for company:', company.name, dbError);
          }
        }
      }
    }

   

    return NextResponse.json({
      status: 'success',
      response: parsedData,
      companiesSaved: savedCompanies,
    });
  } catch (error) {

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}