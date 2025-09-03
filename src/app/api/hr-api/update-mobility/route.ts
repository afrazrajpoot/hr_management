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


    const { department, position, salary ,userId} = await request.json();

    // Validate input
    if (!department || !position || !salary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a department exists for the user
    const existingDepartment = await prisma.department.findFirst({
      where: { userId },
    });

    let updatedDepartment;

    if (existingDepartment) {
      // Safely parse existing JSON arrays or handle non-JSON data
      let currentName: string[] = [];
      let currentPosition: string[] = [];

      if (existingDepartment.name) {
        try {
          // Try parsing as JSON
          currentName = JSON.parse(existingDepartment.name as string);
          // Ensure it's an array
          if (!Array.isArray(currentName)) {
            currentName = [existingDepartment.name as string];
          }
        } catch (e) {
          // If parsing fails, treat as a string and convert to array
          currentName = [existingDepartment.name as string];
        }
      }

      if (existingDepartment.position) {
        try {
          // Try parsing as JSON
          currentPosition = JSON.parse(existingDepartment.position as string);
          // Ensure it's an array
          if (!Array.isArray(currentPosition)) {
            currentPosition = [existingDepartment.position as string];
          }
        } catch (e) {
          // If parsing fails, treat as a string and convert to array
          currentPosition = [existingDepartment.position as string];
        }
      }

      // Append new values
      const updatedName = [...currentName, department];
      const updatedPosition = [...currentPosition, position];

      // Update existing department
      updatedDepartment = await prisma.department.update({
        where: { id: existingDepartment.id },
        data: {
          name: JSON.stringify(updatedName), // Store as JSON array
          position: JSON.stringify(updatedPosition), // Store as JSON array
        },
      });
    } else {
      // Create new department
      updatedDepartment = await prisma.department.create({
        data: {
          id: crypto.randomUUID(),
          name: JSON.stringify([department]), // Start with new JSON array
          position: JSON.stringify([position]), // Start with new JSON array
          hrId: userId, // Assuming hrId is same as userId; adjust if different
          userId,
        },
      });
    }

    // Update User model (assuming salary is a field in User)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { salary: salary }, // Ensure salary is a number
    });

    return NextResponse.json({
      message: "Successfully updated employee data",
      department: updatedDepartment,
      user: { salary: updatedUser.salary },
    });
  } catch (error) {
    console.error("Error updating employee data:", error);
    return NextResponse.json(
      { error: "Failed to update employee data" },
      { status: 500 }
    );
  }
}