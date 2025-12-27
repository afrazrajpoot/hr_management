import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// Set max duration for this route (60 seconds)
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Get session to retrieve user ID
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { department, position, salary, userId, transfer, promotion } = await request.json();

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
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

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
      const result = await prisma.$transaction(async (tx) => {
        // Find all departments for the HR
        const departments = await tx.department.findMany({
          where: { hrId: session.user.id },
        });

        const targetDepartment = departments.find((dept: any) => dept.name === validatedDepartment);
        if (!targetDepartment) {
          throw new Error(`Target department '${validatedDepartment}' not found`);
        }

        const updates = [];

        // Update target department
        updates.push(tx.department.update({
          where: { id: targetDepartment.id },
          data: {
            ingoing: { push: ingoingData },
            promotion: validatedPromotion || targetDepartment.promotion,
            transfer: "outgoing",
          },
        }));

        // Update source department if it exists
        if (sourceDepartmentName) {
          const sourceDepartment = departments.find((dept: any) => dept.name === sourceDepartmentName);
          if (sourceDepartment) {
            const outgoingData = {
              userId,
              department: sourceDepartmentName,
              timestamp: currentTimestamp,
            };
            updates.push(tx.department.update({
              where: { id: sourceDepartment.id },
              data: {
                outgoing: { push: outgoingData },
                promotion: validatedPromotion || sourceDepartment.promotion,
                transfer: "outgoing",
              },
            }));
          }
        }

        // Update user
        updates.push(tx.user.update({
          where: { id: userId },
          data: {
            department: userDepartments,
            position: userPositions,
            salary: validatedSalary,
          },
        }));

        const results = await Promise.all(updates);
        return results[results.length - 1] as any; // Return the updated user
      });

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
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          department: userDepartments,
          position: userPositions,
          salary: validatedSalary, // Ensure salary is a string
        },
      });

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
    console.error("Error updating employee data:", error);
    return NextResponse.json(
      { error: "Failed to update employee data" },
      { status: 500 }
    );
  }
}