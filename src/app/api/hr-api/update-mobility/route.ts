import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import crypto from "crypto";

// Set max duration for this route (60 seconds)
export const maxDuration = 60;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string, reqId: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[${reqId}] ${label} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export async function POST(request: Request) {
  const reqId = crypto.randomUUID();
  const startedAt = Date.now();

  try {
    console.log(`[${reqId}] update-mobility: start`);

    // Get session to retrieve user ID
    const session = await withTimeout(getServerSession(authOptions), 10000, "getServerSession", reqId);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await withTimeout(request.json(), 5000, "request.json", reqId);
    const { department, position, salary, userId, transfer, promotion } = body as any;

    // Validate input
    if (!department || !position || !salary || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure department and position are strings, not arrays
    const validatedDepartment = Array.isArray(department) ? department[0] : department;
    const validatedPosition = Array.isArray(position) ? position[0] : position;

    // Ensure salary is a string to match Prisma schema
    const validatedSalary = typeof salary === "number" ? salary.toString() : String(salary);
    if (!validatedSalary || isNaN(parseFloat(validatedSalary))) {
      return NextResponse.json(
        { error: "Invalid salary value" },
        { status: 400 }
      );
    }

    // Convert promotion to string or null
    const validatedPromotion = typeof promotion === "boolean" ? promotion.toString() : promotion || null;

    // Fetch existing user
    const existingUser = await withTimeout(
      prisma.user.findUnique({
      where: { id: userId },
      }),
      10000,
      "prisma.user.findUnique",
      reqId
    );

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare user update data
    const userDepartments = [...(existingUser.department || []), validatedDepartment];
    const userPositions = [...(existingUser.position || []), validatedPosition];

    if (transfer === true) {
      const currentTimestamp = new Date().toISOString();
      const ingoingData = {
        userId,
        department: validatedDepartment,
        timestamp: currentTimestamp,
      };

      let sourceDepartmentName = null;
      if (existingUser.department && existingUser.department.length > 0) {
        sourceDepartmentName = existingUser.department[existingUser.department.length - 1];
      }

      // Execute everything in a transaction
      const result = await withTimeout(
        prisma.$transaction(async (tx) => {
        // Find all departments for the HR
        const departments = await tx.department.findMany({
          where: { hrId: session.user.id },
        });

        const targetDepartment = departments.find((dept: any) => dept.name === validatedDepartment);
        if (!targetDepartment) {
          throw new Error(`Target department '${validatedDepartment}' not found`);
        }

        // IMPORTANT: interactive transactions run on a single connection.
        // Do NOT execute queries in parallel (Promise.all) inside the callback.
        // Update target department
        await tx.department.update({
          where: { id: targetDepartment.id },
          data: {
            ingoing: { push: ingoingData },
            promotion: validatedPromotion || targetDepartment.promotion,
            transfer: "outgoing",
          },
        });

        // Update source department if it exists
        if (sourceDepartmentName) {
          const sourceDepartment = departments.find((dept: any) => dept.name === sourceDepartmentName);
          if (sourceDepartment) {
            const outgoingData = {
              userId,
              department: sourceDepartmentName,
              timestamp: currentTimestamp,
            };
            await tx.department.update({
              where: { id: sourceDepartment.id },
              data: {
                outgoing: { push: outgoingData },
                promotion: validatedPromotion || sourceDepartment.promotion,
                transfer: "outgoing",
              },
            });
          }
        }

        // Update user
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            department: userDepartments,
            position: userPositions,
            salary: validatedSalary,
          },
        });

        return updatedUser as any;
      }),
        30000,
        "prisma.$transaction",
        reqId
      );

      console.log(`[${reqId}] update-mobility: success transfer=true in ${Date.now() - startedAt}ms`);
      return NextResponse.json({
        message: "Successfully updated employee data with transfer",
        user: {
          department: result.department,
          position: result.position,
          salary: result.salary,
        },
      });
    } else {
      // Simple user update without transfer
      const updatedUser = await withTimeout(
        prisma.user.update({
          where: { id: userId },
          data: {
            department: userDepartments,
            position: userPositions,
            salary: validatedSalary, // Ensure salary is a string
          },
        }),
        20000,
        "prisma.user.update",
        reqId
      );

      console.log(`[${reqId}] update-mobility: success transfer=false in ${Date.now() - startedAt}ms`);
      return NextResponse.json({
        message: "Successfully updated employee data",
        user: {
          department: updatedUser.department,
          position: updatedUser.position,
          salary: updatedUser.salary,
        },
      });
    }
  } catch (error) {
    console.error(`[${reqId}] update-mobility: error after ${Date.now() - startedAt}ms`, error);
    return NextResponse.json(
      { error: "Failed to update employee data" },
      { status: 500 }
    );
  }
}