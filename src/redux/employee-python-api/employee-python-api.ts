// lib/features/employee/employeeApiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

interface RecommendedCourse {
  title: string;
  provider: string;
  url: string;
  reason: string;
}

interface ProgressTracking {
  current_position: string;
  previous_position: string | null;
  current_department: string;
  previous_department: string | null;
}

interface Skill {
  name: string;
  proficiency: number;
}

interface EmployeeLearningResponse {
  employee_id: string;
  employee_name: string;
  current_skills: Skill[];
  recommended_courses: RecommendedCourse[];
  progress_tracking: ProgressTracking;
}

export const employeePythonApi = createApi({
  reducerPath: "employeePythonApi",
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
  tagTypes: ["EmployeeLearning"],

  endpoints: (builder) => ({
    getEmployeeLearningDashboard: builder.query<
      EmployeeLearningResponse,
      string
    >({
      query: (userId) => ({
        url: `/employees/learning-dashboard?user_id=${userId}`,
        method: "GET",
      }),
      providesTags: ["EmployeeLearning"],
      keepUnusedDataFor: 3600, // Cache data for 1 hour
    }),
    getEmployeeDashboardAnalytics: builder.query<any, string>({
      query: (employeeId) => ({
        url: "/employee_dashboard/dashboard-data",
        method: "POST",
        body: { employeeId },
      }),
      keepUnusedDataFor: 3600, // Cache for 1 hour
    }),
  }),
});

export const {
  useGetEmployeeLearningDashboardQuery,
  useGetEmployeeDashboardAnalyticsQuery,
} = employeePythonApi;
