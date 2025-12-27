import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getQuestionsByPart } from "@/lib/assessment-questions";
import type { PartWithQuestions } from "@/types/assessment-types";
import { authOptions } from "@/app/auth";

// Set max duration for this route (30 seconds)
export const maxDuration = 30;

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
 * 3. Employee profile completion (experience and skills only)
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

        // Check if employee profile exists
        if (!user.employee) {
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

        // Get the employee
        const employee = user.employee;

        // Check experience field (assuming it's stored in employee model)
        const hasValidExperience = employee.experience !== null &&
            employee.experience !== undefined &&
            employee.experience !== '';

        // Check skills field
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

        // Check if both experience and skills are present
        const isProfileComplete = hasValidExperience && hasValidSkills;

        if (!isProfileComplete) {
            const missingFields = [];
            if (!hasValidExperience) missingFields.push("experience");
            if (!hasValidSkills) missingFields.push("skills");

            // Create a user-friendly error message
            let errorMessage = "Complete your profile before taking assessment";

            if (missingFields.length > 0) {
                errorMessage += ". Please add: ";
                if (!hasValidExperience) errorMessage += "your work experience, ";
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
                hasExperience: hasValidExperience,
                hasSkills: hasValidSkills,
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