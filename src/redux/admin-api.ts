import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["Employee"], // ✅ define tag
  endpoints: (builder) => ({
    getHrEmployee: builder.query<
      {
        employees: any[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalEmployees: number;
          limit: number;
        };
      },
      { page?: number; limit?: number; search?: string; department?: string }
    >({
      query: ({ page = 1, limit = 10, search = "", department = "" }) =>
        `/admin/get-admin-employee?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&department=${encodeURIComponent(department)}`,
      providesTags: ["Employee"], // ✅ provides tag
    }),
    updateEmployee: builder.mutation<
      { message: string; department: any; user: { salary: number } },
      {
        department: string;
        position: string;
        salary: string;
        userId: string;
        transfer: string;
        promotion: string;
      },
      {
        transfer: any;
        promotion: any;
      }
    >({
      query: (body) => ({
        url: "/hr-api/update-mobility",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee"], // ✅ invalidates cache
    }),
  }),
});

export const { useGetHrEmployeeQuery, useUpdateEmployeeMutation } = adminApi;
