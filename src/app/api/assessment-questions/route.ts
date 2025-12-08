import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getQuestionsByPart } from "@/lib/assessment-questions";
import type { PartWithQuestions } from "@/types/assessment-types";
import { authOptions } from "@/app/auth";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to shuffle options for all questions
function shuffleAllQuestionsOptions(questionsByPart: PartWithQuestions[]): PartWithQuestions[] {
    return questionsByPart.map(part => ({
        ...part,
        questions: part.questions.map(question => ({
            ...question,
            options: shuffleArray(question.options)
        }))
    }));
}

/**
 * GET /api/assessment-questions
 * Returns all assessment questions grouped by part
 * Includes checks for:
 * 1. User subscription status
 * 2. Existing individual report
 * 3. Employee profile completion (department, position from User, skills from Employee)
 */
export async function GET() {
    try {
        // Get user session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Fetch user with related data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User not found",
                },
                { status: 404 }
            );
        }

        // Check if user has paid
        if (!user.paid) {
            // Check if user already has an individual report
            const existingReport = await prisma.individualEmployeeReport.findFirst({
                where: { userId: user.id },
            });

            if (existingReport) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Subscribe to attempt assessment multiple times",
                        hasExistingReport: true,
                        needsSubscription: true,
                        data: null,
                    },
                    { status: 402 } // Payment required
                );
            }
        }

        // Check if employee profile exists and has required fields
        if (user.employee) {
            // Get the employee
            const employee = user.employee;

            // Check User fields: department and position (arrays)
            const userDepartment = user.department || [];
            const userPosition = user.position || [];

            // Check Employee field: skills (JSON field)
            let hasValidSkills = false;
            if (employee.skills) {
                if (Array.isArray(employee.skills)) {
                    hasValidSkills = employee.skills.length > 0;
                } else if (typeof employee.skills === 'string') {
                    hasValidSkills = employee.skills.trim() !== '';
                }
                // If skills is stored as JSON object, check if it has any properties
                else if (typeof employee.skills === 'object' && employee.skills !== null) {
                    hasValidSkills = Object.keys(employee.skills).length > 0;
                }
            }

            // Check if all required fields are present
            const hasValidDepartment = Array.isArray(userDepartment) && userDepartment.length > 0;
            const hasValidPosition = Array.isArray(userPosition) && userPosition.length > 0;

            const isProfileComplete = hasValidDepartment && hasValidPosition && hasValidSkills;

            if (!isProfileComplete) {
                const missingFields = [];
                if (!hasValidDepartment) missingFields.push("department");
                if (!hasValidPosition) missingFields.push("position");
                if (!hasValidSkills) missingFields.push("skills");

                // Create a user-friendly error message
                let errorMessage = "Complete your profile before taking assessment";

                if (missingFields.length > 0) {
                    errorMessage += ". Please add: ";
                    if (!hasValidDepartment) errorMessage += "your department, ";
                    if (!hasValidPosition) errorMessage += "your position, ";
                    if (!hasValidSkills) errorMessage += "at least one skill";
                    // Remove trailing comma and space
                    errorMessage = errorMessage.replace(/, $/, "");
                }

                return NextResponse.json(
                    {
                        success: false,
                        message: errorMessage,
                        isProfileComplete: false,
                        missingFields: missingFields,
                        missingFieldCount: missingFields.length,
                        data: null,
                    },
                    { status: 400 }
                );
            }
        } else {
            // User doesn't have an employee record
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee profile not found. Please complete your profile setup.",
                    hasEmployeeProfile: false,
                    data: null,
                },
                { status: 400 }
            );
        }

        // All checks passed, get assessment questions and shuffle options
        const questionsByPart: PartWithQuestions[] = getQuestionsByPart();
        
        // Shuffle options for all questions
        const shuffledQuestions = shuffleAllQuestionsOptions(questionsByPart);

        return NextResponse.json({
            success: true,
            data: shuffledQuestions,
            userStatus: {
                paid: user.paid,
                hasEmployeeProfile: true,
                isProfileComplete: true,
                hasDepartment: Array.isArray(user.department) && user.department.length > 0,
                hasPosition: Array.isArray(user.position) && user.position.length > 0,
                hasSkills: !!(user.employee?.skills &&
                    (Array.isArray(user.employee.skills)
                        ? user.employee.skills.length > 0
                        : (typeof user.employee.skills === 'string'
                            ? user.employee.skills.trim() !== ''
                            : (typeof user.employee.skills === 'object' && user.employee.skills !== null
                                ? Object.keys(user.employee.skills).length > 0
                                : false)))),
            },
        });
    } catch (error) {
        console.error("Error fetching assessment questions:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch assessment questions",
            },
            { status: 500 }
        );
    }
}