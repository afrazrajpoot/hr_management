import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export interface DepartmentMetrics {
  avg_scores: {
    genius_factor_score: number;
    retention_risk_score: number;
    mobility_opportunity_score: number;
    productivity_score: number;
    engagement_score: number;
    [key: string]: number;
  };
  employee_count: number;
  engagement_distribution: {
    [key: string]: number;
  };
  first_report_date: string;
  genius_factor_distribution: {
    [key: string]: number;
  };
  last_report_date: string;
  mobility_trend: {
    [key: string]: number;
  };
  productivity_distribution: {
    [key: string]: number;
  };
  retention_risk_distribution: {
    [key: string]: number;
  };
  skills_alignment_distribution: {
    [key: string]: number;
  };
}

export interface DepartmentInput {
  color: string;
  completion: number;
  employee_count: number;
  metrics: DepartmentMetrics;
  name: string;
}

export interface RecommendationCard {
  department: string;
  risk_level: string;
  retention_score: number;
  mobility_opportunities: string[];
  recommendations: string[];
  action_items: string[];
}

export interface AnalysisResponse {
  overall_risk_score: number;
  department_recommendations: RecommendationCard[];
  summary: string;
}

export const retentionApi = createApi({
  reducerPath: "retentionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.geniusfactor.ai",
    prepareHeaders: async (headers) => {
      // Get the session to retrieve the FastAPI token
      const session: any = await getSession();

      if (session?.user?.fastApiToken) {
        // Add the FastAPI token as a Bearer token in the Authorization header
        headers.set("Authorization", `Bearer ${session.user.fastApiToken}`);
      }

      return headers;
    },
  }),
  tagTypes: ["RetentionAnalysis"],
  endpoints: (builder) => ({
    analyzeRetentionRisk: builder.mutation<AnalysisResponse, DepartmentInput[]>(
      {
        query: (departments) => ({
          url: "/api/analysis/retention-risk",
          method: "POST",
          body: departments,
        }),
      }
    ),
    createCareerPathwayRecommendations: builder.mutation<
      any,
      { recruiter_id: string; employee_id: string; exclude_ids?: string[]; page?: number; limit?: number }
    >({
      query: ({ recruiter_id, employee_id, exclude_ids }) => ({
        url: "/employee_dashboard/recommend-companies",
        method: "POST",
        body: { recruiter_id, employee_id, exclude_ids },
      }),
    }),
  }),
});

export const {
  useAnalyzeRetentionRiskMutation,
  useCreateCareerPathwayRecommendationsMutation,
} = retentionApi;
