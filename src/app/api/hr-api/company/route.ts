import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { withTransaction } from "@/lib/prisma-helpers";
import { authOptions } from "@/app/auth";

// Set max duration for this route (60 seconds)
export const maxDuration = 60;

// POST: Create a new company
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId, companyDetail } = await req.json();

    if (!userId || !companyDetail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new company and update user in a transaction with timeout
    const company = await withTransaction(async (tx) => {
      // Check if user exists and has HR role
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.role !== "HR") {
        throw new Error("User not found or not authorized");
      }

      const newCompany = await tx.company.create({
        data: {
          companyDetail,
          hrId: [userId],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { hrId: newCompany.id },
      });

      return newCompany;
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    console.error("Error creating company:", error);
    const status = error.message === "User not found or not authorized" ? 403 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to create company" },
      { status }
    );
  }
}

// PUT: Update an existing company
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, userId, name, companyDetail } = await req.json();

    if (!id || !userId || !companyDetail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists and has HR role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "HR" || user.hrId !== id) {
      return NextResponse.json(
        { error: "User not found or not authorized to update this company" },
        { status: 403 }
      );
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {

        companyDetail,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

// GET: Fetch company details by userId
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Check if user exists and has HR role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "HR") {
      return NextResponse.json(
        { error: "User not found or not authorized" },
        { status: 403 }
      );
    }

    // Fetch company by hrId
    const company = await prisma.company.findFirst({
      where: {
        hrId: {
          has: userId,
        },
      },
    });

    if (!company) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}