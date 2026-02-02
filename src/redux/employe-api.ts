// redux/employe-api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Recommendation {
  name: string;
  reason: string;
  score: number;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface Filters {
  page?: number;
  limit?: number;
  forceRefresh?: boolean;
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["Employee", "Recommendations"],
  endpoints: (builder) => ({
    getEmployee: builder.query<void, void>({
      query: () => "/employe-profile",
      providesTags: ["Employee"],
      keepUnusedDataFor: 3600, // Cache for 1 hour
    }),
    createOrUpdateEmployee: builder.mutation<void, void>({
      query: (employee) => ({
        url: "/employe-profile",
        method: "POST",
        body: employee,
      }),
      invalidatesTags: ["Employee"],
    }),
    recommendCompanies: builder.query<string[], void>({
      query: () => "/employee-recommendation",
    }),

    getRecommendations: builder.mutation<RecommendationsResponse, Filters>({
      query: (filters) => ({
        url: "/employee-recommendation",
        method: "POST",
        body: filters,
      }),
    }),

    clearRecommendationsCache: builder.mutation<void, void>({
      query: () => ({
        url: "/recommendations",
        method: "POST",
        body: { action: "clear-cache" },
      }),
      invalidatesTags: ["Recommendations"],
    }),
    getDashboardData: builder.query<void, void>({
      query: () => "/employee-dashboard-data",
      keepUnusedDataFor: 3600, // Cache data for 1 hour
    }),
    getAssessmentResults: builder.query<void, void>({
      query: () => "/assessment-results",
      keepUnusedDataFor: 3600, // Cache data for 1 hour
    }),
  }),
});

export const {
  useGetEmployeeQuery,
  useCreateOrUpdateEmployeeMutation,
  useRecommendCompaniesQuery,
  useGetRecommendationsMutation,
  useClearRecommendationsCacheMutation,
  useGetDashboardDataQuery,
  useGetAssessmentResultsQuery,
} = employeeApi;
