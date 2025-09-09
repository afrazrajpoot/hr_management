import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  reducerPath: 'retentionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  }),
  tagTypes: ['RetentionAnalysis'],
  endpoints: (builder) => ({
    analyzeRetentionRisk: builder.mutation<AnalysisResponse, DepartmentInput[]>({
      query: (departments) => ({
        url: '/api/analysis/retention-risk',
        method: 'POST',
        body: departments,
      }),
    }),
  }),
});

export const { useAnalyzeRetentionRiskMutation } = retentionApi;