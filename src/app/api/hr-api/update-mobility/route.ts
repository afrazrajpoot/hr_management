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

    // Convert promotion to string or null
    const validatedPromotion = typeof promotion === "boolean" ? promotion.toString() : promotion || null;

    // Update User model with new department, position, and salary
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Append department and position to user's arrays
    const userDepartments = [...(existingUser.department || []), department];
    const userPositions = [...(existingUser.position || []), position];

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        department: userDepartments,
        position: userPositions,
        salary,
      },
    });

    // Prepare ingoing and outgoing data
    const currentTimestamp = new Date().toISOString();
    const ingoingData = {
      userId,
      department,
      timestamp: currentTimestamp,
    };

    // Get the last department from the user's department array for outgoing data
    let outgoingData = null;
    let sourceDepartmentName = null;
    if (transfer === "outgoing" && existingUser.department && existingUser.department.length > 0) {
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

    let updatedDepartments = [];

    // Handle transfer logic: update ingoing and outgoing for relevant departments
    if (transfer && sourceDepartmentName) {
      // Find the target (new) department and source (old) department
      const targetDepartment = departments.find((dept:any) => dept.name === department);
      const sourceDepartment = departments.find((dept:any) => dept.name === sourceDepartmentName);

      // Check if target department exists
      if (!targetDepartment) {
        return NextResponse.json(
          { error: `Target department '${department}' not found` },
          { status: 404 }
        );
      }

      // Check if source department exists (if transfer is outgoing)
      if (transfer === "outgoing" && !sourceDepartment) {
        return NextResponse.json(
          { error: `Source department '${sourceDepartmentName}' not found` },
          { status: 404 }
        );
      }

      // Update target department (append to ingoing)
      const updatedTargetDept = await prisma.department.update({
        where: { id: targetDepartment.id },
        data: {
          ingoing: {
            push: ingoingData, // Append to ingoing array
          },
          promotion: validatedPromotion || targetDepartment.promotion,
          transfer: transfer || targetDepartment.transfer,
        },
      });
      updatedDepartments.push(updatedTargetDept);

      // Update source department (append to outgoing) if it exists
      if (sourceDepartment && outgoingData) {
        const updatedSourceDept = await prisma.department.update({
          where: { id: sourceDepartment.id },
          data: {
            outgoing: {
              push: outgoingData, // Append to outgoing array
            },
            promotion: validatedPromotion || sourceDepartment.promotion,
            transfer: transfer || sourceDepartment.transfer,
          },
        });
        updatedDepartments.push(updatedSourceDept);
      }
    } else {
      // No transfer, just update the target department
      const targetDepartment = departments.find((dept:any) => dept.name === department);

      if (!targetDepartment) {
        return NextResponse.json(
          { error: `Target department '${department}' not found` },
          { status: 404 }
        );
      }

      const updatedDept = await prisma.department.update({
        where: { id: targetDepartment.id },
        data: {
          ingoing: {
            push: ingoingData, // Append to ingoing array
          },
          promotion: validatedPromotion || targetDepartment.promotion,
          transfer: transfer || targetDepartment.transfer,
        },
      });
      updatedDepartments.push(updatedDept);
    }

    return NextResponse.json({
      message: "Successfully updated employee data",
      departments: updatedDepartments,
      user: {
        department: updatedUser.department,
        position: updatedUser.position,
        salary: updatedUser.salary,
      },
    });
  } catch (error) {
    console.error("Error updating employee data:", error);
    return NextResponse.json(
      { error: "Failed to update employee data" },
      { status: 500 }
    );
  }
}