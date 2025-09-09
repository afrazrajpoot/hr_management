// lib/features/employee/employeeApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  reducerPath: 'employeeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['Employee'],
  endpoints: (builder) => ({
    getEmployeeLearningDashboard: builder.mutation<EmployeeLearningResponse, string>({
      query: (userId) => ({
        url: '/employees/learning-dashboard',
        method: 'POST',
        body: { user_id: userId },
      }),
      invalidatesTags: ['Employee'],
    }),
  }),
});

export const { useGetEmployeeLearningDashboardMutation } = employeePythonApi;