import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const hrApi = createApi({
  reducerPath: 'hrApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getHrEmployee: builder.query<void, void>({
      query: () => '/hr-api/hr-employee',
    }),
    updateEmployee: builder.mutation<
      { message: string; department: any; user: { salary: number } },
      { department: string; position: string; salary: string;userId:string }
    >({
      query: (body) => ({
        url: '/hr-api/update-mobility',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetHrEmployeeQuery, useUpdateEmployeeMutation } = hrApi;