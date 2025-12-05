import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  department?: string;
  position?: string;
  manager?: string;
  employeeId: string;
  salary?: string;
  bio?: string;
  avatar?: string;
  skills: any[];
  education?: any[];
  experience?: any[];
  resume?: string | null;
}

// GET: Fetch employee data for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma || !prisma.employee) {
      console.error(
        "Prisma client or Employee model is not properly initialized"
      );
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    const employee = await prisma.employee.findFirst({
      where: { employeeId: session.user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            position: true,
            department: true,
            salary: true,
          },
        },
      },
    });

    if (!employee) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          position: true,
          department: true,
          salary: true,
        },
      });

      return NextResponse.json({
        id: "",
        employeeId: session.user.id,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        address: "",
        dateOfBirth: "",
        hireDate: "",
        department: user?.department?.at(-1) || "",
        position: user?.position?.at(-1) || "",
        manager: "",
        salary: user?.salary || "",
        bio: "",
        avatar: "",
        skills: [],
        education: [],
        experience: [],
        resume: null,
      });
    }

    return NextResponse.json({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.user?.email || "",
      phone: employee.user?.phoneNumber || "",
      address: employee.address || "",
      dateOfBirth: employee.dateOfBirth?.toISOString().split("T")[0] || "",
      hireDate: employee.hireDate?.toISOString().split("T")[0] || "",
      department: employee.user?.department?.at(-1) || "",
      position: employee.user?.position?.at(-1) || "",
      manager: employee.manager || "",
      salary: employee.user?.salary || "",
      bio: employee.bio || "",
      avatar: employee.avatar || "",
      skills: employee.skills || [],
      education: employee.education || [],
      experience: employee.experience || [],
      resume: employee.resume || null,
    });
  } catch (error: any) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create or update employee data
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    if (!prisma || !prisma.employee) {
      console.error(
        "Prisma client or Employee model is not properly initialized"
      );
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration error"
        },
        { status: 500 }
      );
    }

    const data: EmployeeData = await req.json();
    console.log("Received employee data:", JSON.stringify(data, null, 2));

    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: firstName, lastName, or email"
        },
        { status: 400 }
      );
    }

    // Validate password only if provided and not masked
    if (data.password && data.password !== "********") {
      if (data.password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: "Password must be at least 8 characters long"
          },
          { status: 400 }
        );
      }
      // Additional password validation (e.g., complexity)
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(data.password)) {
        return NextResponse.json(
          {
            success: false,
            error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          },
          { status: 400 }
        );
      }
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: { employeeId: session.user.id },
      include: { user: true },
    });

    console.log("Existing employee:", existingEmployee);

    let employee;
    let user;

    try {
      // Start transaction
      const result = await prisma.$transaction(async (tx: any) => {
        // Prepare user update data
        const userData: any = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phone || null,
          salary: data.salary || null,
        };

        // Handle department and position - ensure they are arrays
        if (data.department) {
          userData.department = Array.isArray(data.department)
            ? data.department
            : [data.department];
        }

        if (data.position) {
          userData.position = Array.isArray(data.position)
            ? data.position
            : [data.position];
        }

        // Hash password only if provided and not masked
        if (data.password && data.password !== "********") {
          userData.password = await bcrypt.hash(data.password, 10);
        }

        // Update user
        const updatedUser = await tx.user.update({
          where: { id: session.user.id },
          data: userData,
        });

        // Prepare employee data according to your schema
        // Employee model has: firstName, lastName, address, dateOfBirth, hireDate, manager, bio, avatar, skills, education, experience, resume
        const employeeData: any = {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          hireDate: data.hireDate ? new Date(data.hireDate) : null,
          manager: data.manager || null,
          bio: data.bio || null,
          avatar: data.avatar || null,
          resume: data.resume || null,
        };

        // Handle JSON fields
        if (data.skills) {
          employeeData.skills = Array.isArray(data.skills) ? data.skills : [];
        }

        if (data.education) {
          employeeData.education = Array.isArray(data.education) ? data.education : [];
        }

        if (data.experience) {
          employeeData.experience = Array.isArray(data.experience) ? data.experience : [];
        }

        if (existingEmployee) {
          // Update existing employee
          employee = await tx.employee.update({
            where: { id: existingEmployee.id },
            data: employeeData,
          });
        } else {
          // Create new employee
          employee = await tx.employee.create({
            data: {
              employeeId: session.user.id,
              ...employeeData,
              user: {
                connect: { id: session.user.id },
              },
            },
          });

          // Update user with employeeId
          await tx.user.update({
            where: { id: session.user.id },
            data: {
              employeeId: employee.id,
            },
          });
        }

        return { employee, user: updatedUser };
      });

      employee = result.employee;
      user = result.user;

      console.log("Successfully saved employee:", {
        employeeId: employee.id,
        department: user.department,
        position: user.position,
        skills: employee.skills,
      });

      return NextResponse.json({
        success: true,
        message: existingEmployee ? "Profile updated successfully" : "Profile created successfully",
        data: {
          id: employee.id,
          employeeId: employee.employeeId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phoneNumber || "",
          address: employee.address || "",
          dateOfBirth: employee.dateOfBirth?.toISOString().split("T")[0] || "",
          hireDate: employee.hireDate?.toISOString().split("T")[0] || "",
          department: user.department?.at(-1) || "",
          position: user.position?.at(-1) || "",
          manager: employee.manager || "",
          salary: user.salary || "",
          bio: employee.bio || "",
          avatar: employee.avatar || "",
          skills: employee.skills || [],
          education: employee.education || [],
          experience: employee.experience || [],
          resume: employee.resume || null,
        },
      });

    } catch (transactionError: any) {
      console.error("Transaction error details:", {
        message: transactionError.message,
        code: transactionError.code,
        meta: transactionError.meta,
      });
      throw transactionError;
    }

  } catch (error: any) {
    console.error("Error creating/updating employee:", error);

    // Handle specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Employee ID or email already exists"
        },
        { status: 409 }
      );
    }

    if (error.message?.includes("Password")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    // Handle unknown field errors
    if (error.message?.includes("Unknown argument")) {
      const fieldMatch = error.message.match(/Unknown argument `(\w+)`/);
      const fieldName = fieldMatch ? fieldMatch[1] : "unknown field";
      return NextResponse.json(
        {
          success: false,
          error: `Invalid field: ${fieldName}. Please check the data being sent.`
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}