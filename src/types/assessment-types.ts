/**
 * Assessment Question Types
 * Type definitions for the career assessment system
 */

export interface AssessmentQuestion {
    id: number;
    type: string;
    question: string;
    options: string[];
    category: string;
}

export interface AssessmentSection {
    section: string;
    questions: AssessmentQuestion[];
}

export interface AssessmentPart {
    part: string;
    sections: AssessmentSection[];
}

export interface QuestionWithSection extends AssessmentQuestion {
    section: string;
}

export interface PartWithQuestions {
    part: string;
    questions: QuestionWithSection[];
}

/**
 * API Request/Response Types
 */

export interface OptionCounts {
    [key: string]: number;
}

export interface AssessmentPartData {
    part: string;
    optionCounts: OptionCounts;
}

export interface DetailedAnswer {
    id: number;
    part: string;
    section: string;
    question: string;
    selectedOption: string | null;
}

export interface AssessmentSubmissionRequest {
    data: AssessmentPartData[];
    userId: string;
    hrId: string;
    departement: string;
    employeeName: string;
    employeeEmail: string;
    is_paid: boolean;
    allAnswers: DetailedAnswer[];
}

export interface AssessmentAnalysisResult {
    part: string;
    majorityOptions: string[] | null;
    maxCount: number;
}

export interface AssessmentSubmissionResponse {
    results?: AssessmentAnalysisResult[];
    [key: string]: any;
}

export interface CareerRecommendationRequest {
    employeeId: string;
}
