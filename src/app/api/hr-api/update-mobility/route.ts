import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

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
      // Handle transfer: update ingoing and outgoing for relevant departments
      const currentTimestamp = new Date().toISOString();
      const ingoingData = {
        userId,
        department: validatedDepartment,
        timestamp: currentTimestamp,
      };

      // Get the last department from the user's department array for outgoing data
      let outgoingData = null;
      let sourceDepartmentName = null;
      if (existingUser.department && existingUser.department.length > 0) {
        sourceDepartmentName = existingUser.department[existingUser.department.length - 1];
        outgoingData = {
          userId,
          department: sourceDepartmentName,
          timestamp: currentTimestamp,
        };
      }

      // Find all departments for the HR
      let departments = [];
      try {
        departments = await prisma.department.findMany({
          where: {
            hrId: session.user.id,
          },
        });
      } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json(
          { error: "Failed to fetch departments" },
          { status: 500 }
        );
      }

      // Find target and source departments
      const targetDepartment = departments.find((dept: any) => dept.name === validatedDepartment);
      if (!targetDepartment) {
        return NextResponse.json(
          { error: `Target department '${validatedDepartment}' not found` },
          { status: 404 }
        );
      }

      let updatedDepartments = [];

      // Update target department (append to ingoing)
      const updatedTargetDept = await prisma.department.update({
        where: { id: targetDepartment.id },
        data: {
          ingoing: {
            push: ingoingData, // Append to ingoing array
          },
          promotion: validatedPromotion || targetDepartment.promotion,
          transfer: "outgoing", // Set to "outgoing" since transfer is true
        },
      });
      updatedDepartments.push(updatedTargetDept);

      // Update source department (append to outgoing) if it exists
      if (sourceDepartmentName && outgoingData) {
        const sourceDepartment = departments.find((dept: any) => dept.name === sourceDepartmentName);
        if (!sourceDepartment) {
          return NextResponse.json(
            { error: `Source department '${sourceDepartmentName}' not found` },
            { status: 404 }
          );
        }

        const updatedSourceDept = await prisma.department.update({
          where: { id: sourceDepartment.id },
          data: {
            outgoing: {
              push: outgoingData, // Append to outgoing array
            },
            promotion: validatedPromotion || sourceDepartment.promotion,
            transfer: "outgoing", // Set to "outgoing" since transfer is true
          },
        });
        updatedDepartments.push(updatedSourceDept);
      }

      // Update user with new department, position, and salary
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          department: userDepartments,
          position: userPositions,
          salary: validatedSalary, // Ensure salary is a string
        },
      });

      return NextResponse.json({
        message: "Successfully updated employee data with transfer",
        departments: updatedDepartments,
        user: {
          department: updatedUser.department,
          position: updatedUser.position,
          salary: updatedUser.salary,
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