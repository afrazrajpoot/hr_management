import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const hrApi = createApi({
  reducerPath: 'hrApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['Employee'], // ✅ define tag
  endpoints: (builder) => ({
    getHrEmployee: builder.query<void, void>({
      query: () => '/hr-api/hr-employee',
      providesTags: ['Employee'], // ✅ provides tag
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
        transfer: any; promotion: any
      }
    >({
      query: (body) => ({
        url: '/hr-api/update-mobility',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employee'], // ✅ invalidates cache
    }),
  }),
});

export const { useGetHrEmployeeQuery, useUpdateEmployeeMutation } = hrApi;
