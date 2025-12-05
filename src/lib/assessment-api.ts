import type {
    AssessmentSubmissionRequest,
    AssessmentSubmissionResponse,
    AssessmentAnalysisResult,
    CareerRecommendationRequest,
    PartWithQuestions,
} from "@/types/assessment-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_URL;

/**
 * Fetch assessment questions from the local API
 * 
 * @returns Promise resolving to the list of assessment parts with questions
 */
// Updated fetchAssessmentQuestions in @/lib/assessment-api.ts
// This ensures we always return the full response, even for non-success cases,
// so the component can handle guideline messages without falling into catch block.

export async function fetchAssessmentQuestions(): Promise<{
    success: boolean;
    data?: PartWithQuestions[];
    error?: string;
    message?: string;
    hasExistingReport?: boolean;
    needsSubscription?: boolean;
    isProfileComplete?: boolean;
    missingFields?: string[];
    hasEmployeeProfile?: boolean;
    userStatus?: { paid: boolean; hasEmployeeProfile: boolean; isProfileComplete: boolean };
}> {
    try {
        const response = await fetch('/api/assessment-questions', {
            credentials: 'include', // Ensure session cookies are sent
        });

        // Always parse JSON, even if not OK (e.g., 400, 401), to get guideline details
        const json = await response.json();

        // Return the full JSON response regardless of success
        return {
            ...json,
            success: json.success !== undefined ? json.success : response.ok,
        };
    } catch (error) {
        console.error('Network error fetching assessment questions:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection and try again.',
        };
    }
}
/**
 * Submit assessment data to the Python API for analysis
 * 
 * @param data - Complete assessment submission data
 * @param authToken - FastAPI authentication token
 * @returns Analysis results from the API
 * @throws Error if the API request fails
 */
export async function submitAssessment(
    data: AssessmentSubmissionRequest,
    authToken: string
): Promise<AssessmentAnalysisResult[]> {
    const response = await fetch(`${API_BASE_URL}/analyze/assessment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `API request failed with status ${response.status}: ${errorText}`
        );
    }

    const result: AssessmentSubmissionResponse = await response.json();

    // Handle different response structures flexibly
    // The API might return { results: [...] } or just the array directly
    let analysisData: AssessmentAnalysisResult[] | null = null;

    if (result && result.results) {
        // Standard format: { results: [...] }
        analysisData = result.results;
    } else if (Array.isArray(result)) {
        // Direct array format: [...]
        analysisData = result as AssessmentAnalysisResult[];
    } else if (result && typeof result === "object") {
        // Fallback: try to use the result as-is if it's an object
        analysisData = result as any;
    }

    if (!analysisData) {
        console.error("Invalid API response:", result);
        throw new Error("Invalid response from API - no valid data received");
    }

    return analysisData;
}

/**
 * Generate career recommendation for an employee after assessment completion
 * 
 * @param employeeId - ID of the employee
 * @param authToken - FastAPI authentication token
 * @returns Promise that resolves when recommendation is generated
 */
export async function generateCareerRecommendation(
    employeeId: string,
    authToken: string
): Promise<void> {
    const requestData: CareerRecommendationRequest = { employeeId };

    const response = await fetch(
        `${API_BASE_URL}/employee_dashboard/generate-employee-career-recommendation`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(requestData),
        }
    );

    if (!response.ok) {
        console.error("Failed to generate career recommendation:", response.status);
        throw new Error(`Failed to generate career recommendation: ${response.status}`);
    }
}
