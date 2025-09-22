import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const hrApi = createApi({
  reducerPath: "hrApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["Employee"],
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
      { 
        page?: number; 
        limit?: number; 
        search?: string; 
        department?: string;
        risk?: string;     // ✅ Added
        status?: string;   // ✅ Added
      }
    >({
      query: ({ 
        page = 1, 
        limit = 10, 
        search = "", 
        department = "", 
        risk = "",        // ✅ Added
        status = ""       // ✅ Added
      }) => {
        // Build URL with all parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search: encodeURIComponent(search) }),
          ...(department && { department: encodeURIComponent(department) }),
          ...(risk && { risk: encodeURIComponent(risk) }),
          ...(status && { status: encodeURIComponent(status) }),
        });

        console.log('RTK Query URL:', `/hr-api/hr-employee?${params.toString()}`); // Debug log
        
        return `/hr-api/hr-employee?${params.toString()}`;
      },
      providesTags: ["Employee"],
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
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const { useGetHrEmployeeQuery, useUpdateEmployeeMutation } = hrApi;